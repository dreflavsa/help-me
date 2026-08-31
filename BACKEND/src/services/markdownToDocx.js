const { Paragraph, TextRun, AlignmentType, BorderStyle } = require("docx");

const COULEUR_MARQUE = "6B4A87";
const COULEUR_TEXTE = "242124";
const COULEUR_BORDURE_LEGERE = "D9D1DF";

function _analyserInline(texte) {
    const tokens = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let dernierIndex = 0;
    let correspondance;

    while ((correspondance = regex.exec(texte)) !== null) {
        if (correspondance.index > dernierIndex) {
            tokens.push({ text: texte.slice(dernierIndex, correspondance.index) });
        }

        if (correspondance[2] !== undefined) {
            tokens.push({ text: correspondance[2], bold: true });
        } else if (correspondance[3] !== undefined) {
            tokens.push({ text: correspondance[3], italics: true });
        } else if (correspondance[4] !== undefined) {
            tokens.push({ text: correspondance[4], code: true });
        }

        dernierIndex = regex.lastIndex;
    }

    if (dernierIndex < texte.length) {
        tokens.push({ text: texte.slice(dernierIndex) });
    }

    return tokens.length > 0 ? tokens : [{ text: texte }];
}

function _construireRuns(texte, styleBase) {
    return _analyserInline(texte).map(
        (token) =>
            new TextRun({
                text: token.text,
                bold: styleBase.bold || token.bold || false,
                italics: token.italics || false,
                font: token.code ? "Consolas" : styleBase.font,
                size: token.code
                    ? Math.max((styleBase.size || 21) - 1, 16)
                    : styleBase.size,
                color: styleBase.color,
            }),
    );
}

function markdownVersParagraphesDocx(markdown) {
    const lignes = (markdown || "").split("\n");
    const paragraphes = [];

    for (const ligneBrute of lignes) {
        const ligne = ligneBrute.trimEnd();

        if (!ligne.trim()) continue;

        // Séparateur horizontal : "---"
        if (/^-{3,}$/.test(ligne.trim())) {
            paragraphes.push(
                new Paragraph({
                    spacing: { before: 100, after: 200 },
                    border: {
                        bottom: {
                            style: BorderStyle.SINGLE,
                            size: 4,
                            color: COULEUR_BORDURE_LEGERE,
                        },
                    },
                }),
            );
            continue;
        }

        // Titres : "#" à "######"
        const correspondanceTitre = ligne.match(/^(#{1,6})\s+(.*)$/);
        if (correspondanceTitre) {
            const niveau = correspondanceTitre[1].length;
            const texte = correspondanceTitre[2];
            const taille = Math.max(28 - (niveau - 1) * 3, 20);

            paragraphes.push(
                new Paragraph({
                    spacing: { before: 220, after: 100 },
                    children: _construireRuns(texte, {
                        bold: true,
                        color: COULEUR_MARQUE,
                        size: taille,
                        font: "Aptos Display",
                    }),
                }),
            );
            continue;
        }

        // Liste à puces : "- item" ou "* item"
        const correspondancePuce = ligne.match(/^[-*]\s+(.*)$/);
        if (correspondancePuce) {
            paragraphes.push(
                new Paragraph({
                    indent: { left: 360 },
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { after: 100, line: 276, lineRule: "auto" },
                    children: [
                        new TextRun({
                            text: "•  ",
                            size: 21,
                            font: "Aptos",
                            color: COULEUR_TEXTE,
                        }),
                        ..._construireRuns(correspondancePuce[1], {
                            size: 21,
                            font: "Aptos",
                            color: COULEUR_TEXTE,
                        }),
                    ],
                }),
            );
            continue;
        }

        // Liste numérotée : "1. item"
        const correspondanceNumero = ligne.match(/^(\d+)\.\s+(.*)$/);
        if (correspondanceNumero) {
            paragraphes.push(
                new Paragraph({
                    indent: { left: 360 },
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { after: 100, line: 276, lineRule: "auto" },
                    children: [
                        new TextRun({
                            text: `${correspondanceNumero[1]}.  `,
                            bold: true,
                            size: 21,
                            font: "Aptos",
                            color: COULEUR_TEXTE,
                        }),
                        ..._construireRuns(correspondanceNumero[2], {
                            size: 21,
                            font: "Aptos",
                            color: COULEUR_TEXTE,
                        }),
                    ],
                }),
            );
            continue;
        }

        // Paragraphe normal
        paragraphes.push(
            new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 140, line: 276, lineRule: "auto" },
                children: _construireRuns(ligne, {
                    size: 21,
                    font: "Aptos",
                    color: COULEUR_TEXTE,
                }),
            }),
        );
    }

    return paragraphes;
}

module.exports = { markdownVersParagraphesDocx };