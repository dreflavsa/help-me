const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Header,
  Footer,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  VerticalAlign,
  PageNumber,
} = require("docx");

const documentRepository = require("../repositories/documentRepository");
const { markdownVersParagraphesDocx } = require("./markdownToDocx");

const DOCUMENTS_DIR = path.join(__dirname, "..", "documents");

fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });

const COULEUR_MARQUE = "6B4A87";
const COULEUR_TEXTE_DISCRET = "6B6270";
const COULEUR_TEXTE = "242124";
const COULEUR_FOND_LEGER = "F2ECF7";
const COULEUR_BORDURE_LEGERE = "D9D1DF";

const AUCUNE_BORDURE = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

const BORDURE_IDENTITE = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: COULEUR_BORDURE_LEGERE,
};

class DocumentService {
  async genererDocument({
    soumissionId,
    utilisateurId,
    logoFile,
    fileValidationError,
  }) {
    if (fileValidationError) {
      if (logoFile) await this._supprimerFichierSilencieux(logoFile.path);

      return {
        success: false,
        code: "LOGO_FORMAT_NON_AUTORISE",
        message: "Le logo doit être une image JPG ou PNG.",
      };
    }

    const donnees = await documentRepository.findDonneesPourDocument(
      soumissionId,
      utilisateurId,
    );

    if (!donnees) {
      if (logoFile) await this._supprimerFichierSilencieux(logoFile.path);

      return {
        success: false,
        code: "CORRECTION_NOT_FOUND",
        message:
          "Aucune correction disponible pour cette soumission. Générez d'abord la correction.",
      };
    }

    try {
      const buffer = await this._construireDocx(donnees, logoFile);

      const nomFichier = `HELP-ME-${donnees.matricule || donnees.soumission_id}-${Date.now()}.docx`;
      const chemin = path.join(DOCUMENTS_DIR, nomFichier);

      await fs.promises.writeFile(chemin, buffer);

      const documentExistant =
        await documentRepository.findDocumentByCorrectionId(
          donnees.correction_id,
        );

      let documentId;

      if (documentExistant) {
        await this._supprimerFichierSilencieux(documentExistant.chemin);

        await documentRepository.updateDocument(documentExistant.id, {
          nomFichier,
          chemin,
          taille: buffer.length,
        });

        documentId = documentExistant.id;
      } else {
        documentId = await documentRepository.createDocument({
          correctionId: donnees.correction_id,
          nomFichier,
          chemin,
          taille: buffer.length,
        });
      }

      return {
        success: true,
        code: "DOCUMENT_GENERATED",
        message: "Document généré avec succès.",
        data: { id: documentId },
      };
    } finally {
      if (logoFile) await this._supprimerFichierSilencieux(logoFile.path);
    }
  }

  // --- Construction du document ---

  async _construireDocx(donnees, logoFile) {
    const logoBuffer = logoFile
      ? await fs.promises.readFile(logoFile.path)
      : null;
    const typeLogo =
      logoFile && path.extname(logoFile.originalname).toLowerCase() === ".png"
        ? "png"
        : "jpg";

    const doc = new Document({
      sections: [
        {
          properties: {
            page: { margin: { header: 360, top: 2000 } },
          },
          headers: {
            default: new Header({
              children: [
                this._tableauEntete(donnees, logoBuffer, typeLogo),
                new Paragraph({
                  text: "",
                  border: {
                    bottom: {
                      style: BorderStyle.SINGLE,
                      size: 6,
                      color: COULEUR_MARQUE,
                    },
                  },
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `HELP ME  •  ${new Date().toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )}  •  Page `,
                      bold: true,
                      size: 16,
                      color: COULEUR_TEXTE_DISCRET,
                      font: "Aptos",
                    }),
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      bold: true,
                      size: 16,
                      color: COULEUR_TEXTE_DISCRET,
                      font: "Aptos",
                    }),
                  ],
                }),
              ],
            }),
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 240, after: 80 },
              children: [
                new TextRun({
                  text: "CORRECTION ACADÉMIQUE",
                  bold: true,
                  color: COULEUR_TEXTE_DISCRET,
                  size: 17,
                  font: "Aptos",
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: donnees.matiere.toUpperCase(),
                  bold: true,
                  color: COULEUR_MARQUE,
                  size: 34,
                  font: "Aptos Display",
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              border: {
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 6,
                  color: COULEUR_MARQUE,
                  space: 4,
                },
              },
              children: [
                new TextRun({
                  text: donnees.titre,
                  bold: true,
                  color: COULEUR_TEXTE,
                  size: 26,
                  font: "Aptos Display",
                }),
              ],
            }),
            this._tableauIdentite(donnees),
            new Paragraph({
              spacing: { before: 240, after: 100 },
              children: [
                new TextRun({
                  // text: "Correction",
                  bold: true,
                  color: COULEUR_MARQUE,
                  size: 28,
                  font: "Aptos Display",
                }),
              ],
            }),
            ...markdownVersParagraphesDocx(donnees.contenu),
          ],
        },
      ],
    });

    return Packer.toBuffer(doc);
  }

  _ligneEntete(texte, options = {}) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: [new TextRun({ text: texte, font: "Aptos", ...options })],
    });
  }

  _tableauEntete(donnees, logoBuffer, typeLogo) {
    const nomEtablissement = donnees.etablissement.toUpperCase();

    const blocPays = (devise1, devise2) => [
      this._ligneEntete(devise1, {
        bold: true,
        color: COULEUR_TEXTE,
        size: 17,
      }),
      this._ligneEntete(devise2, {
        italics: true,
        color: COULEUR_TEXTE_DISCRET,
        size: 15,
      }),
      this._ligneEntete("********", {
        color: COULEUR_TEXTE_DISCRET,
        size: 14,
      }),
      this._ligneEntete(nomEtablissement, {
        bold: true,
        color: COULEUR_MARQUE,
        size: 17,
      }),
    ];

    const celluleFR = new TableCell({
      borders: AUCUNE_BORDURE,
      verticalAlign: VerticalAlign.CENTER,
      width: { size: 3312, type: WidthType.DXA },
      children: blocPays("REPUBLIQUE DU CAMEROUN", "Paix-Travail-Patrie"),
    });

    const celluleLogo = new TableCell({
      borders: AUCUNE_BORDURE,
      verticalAlign: VerticalAlign.CENTER,
      width: { size: 2160, type: WidthType.DXA },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: logoBuffer
            ? [
                new ImageRun({
                  type: typeLogo,
                  data: logoBuffer,
                  transformation: { width: 53, height: 53 },
                }),
              ]
            : [],
        }),
      ],
    });

    const celluleEN = new TableCell({
      borders: AUCUNE_BORDURE,
      verticalAlign: VerticalAlign.CENTER,
      width: { size: 3312, type: WidthType.DXA },
      children: blocPays("REPUBLIC OF CAMEROON", "Peace-Work-FatherLand"),
    });

    return new Table({
      alignment: AlignmentType.CENTER,
      columnWidths: [3888, 2160, 3888],
      rows: [new TableRow({ children: [celluleFR, celluleLogo, celluleEN] })],
    });
  }

  _tableauIdentite(donnees) {
    const ligne = (label, valeur) =>
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: BORDURE_IDENTITE,
              bottom: BORDURE_IDENTITE,
              left: BORDURE_IDENTITE,
              right: BORDURE_IDENTITE,
            },
            shading: { fill: COULEUR_FOND_LEGER },
            width: { size: 4896, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                spacing: { after: 0 },
                children: [
                  new TextRun({
                    text: label,
                    bold: true,
                    color: COULEUR_MARQUE,
                    size: 19,
                    font: "Aptos",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: {
              top: BORDURE_IDENTITE,
              bottom: BORDURE_IDENTITE,
              left: BORDURE_IDENTITE,
              right: BORDURE_IDENTITE,
            },
            width: { size: 4896, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                spacing: { after: 0 },
                children: [
                  new TextRun({
                    text: valeur || "",
                    size: 19,
                    font: "Aptos",
                    color: COULEUR_TEXTE,
                  }),
                ],
              }),
            ],
          }),
        ],
      });

    return new Table({
      alignment: AlignmentType.CENTER,
      columnWidths: [4896, 4896],
      rows: [
        ligne("NOM ET PRÉNOM", `${donnees.nom} ${donnees.prenom}`),
        ligne("MATRICULE", donnees.matricule),
        ligne("FILIÈRE", donnees.filiere),
        ligne("NIVEAU", donnees.niveau),
      ],
    });
  }

  // --- Téléchargement ---

  async getCheminPourTelechargement(documentId, utilisateurId) {
    const document = await documentRepository.findDocumentPourTelechargement(
      documentId,
      utilisateurId,
    );

    if (!document) {
      return {
        success: false,
        code: "DOCUMENT_NOT_FOUND",
        message: "Document introuvable.",
      };
    }

    return { success: true, data: document };
  }

  async _supprimerFichierSilencieux(filePath) {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.error("Erreur suppression fichier :", error.message);
    }
  }
}

module.exports = new DocumentService();
