export const generateHooksFromText = async (text: string): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        "Stop Doing This IMMEDIATELY 🛑",
        "The Secret No One Tells You 🤫",
        "I Tested It So You Don't Have To 🚀",
      ]);
    }, 1500); // Simulate API latency
  });
};

export const translateSubtitles = async (segments: any[], language: string): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock translated strings based on language
      const mockTranslations = {
        "Spanish": [
          "um o uso, sin registro, uh sin pago requerido.",
          "Así es como funciona...",
          "Sube tu video.",
          "Edita tus subtítulos um palabra por palabra.",
          "Personaliza fuentes, colores y posicionamiento.",
          "Ajusta uh el tiempo y el estilo"
        ],
        "French": [
          "um o utilisation, pas d'inscription, uh aucun paiement requis.",
          "Voici comment ça marche...",
          "Téléchargez votre vidéo.",
          "Modifiez vos sous-titres um mot par mot.",
          "Personnalisez les polices, les couleurs et le positionnement.",
          "Ajustez uh le timing et le style"
        ]
      };

      const translatedLabels = (mockTranslations as any)[language] || segments.map(s => `[${language}] ${s.label}`);
      
      const translated = segments.map((seg, idx) => ({
        ...seg,
        label: translatedLabels[idx] || seg.label
      }));
      resolve(translated);
    }, 1500);
  });
};
