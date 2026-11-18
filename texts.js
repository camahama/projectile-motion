(function (global) {
  "use strict";

  // Ändra undervisningstexter och startvärden här utan att behöva redigera app.js.
  global.ProjectileContent = {
    defaults: {
      speed: 20,
      angle: 45,
      gravity: 9.82
    },
    chart: {
      maxX: 1000,
      maxY: 500
    },
    text: {
      eyebrow: "Fysik · Rörelse i två dimensioner",
      title: "Kaströrelse",
      intro: "Ändra utgångshastighet och vinkel. Följ bollens bana och undersök hur flygtid, räckvidd och maxhöjd förändras.",
      plotTitle: "Bollens bana",
      plotHint: "Fast skala · Tidigare kast visas streckade",
      axisEditHint: "Dubbelklicka på ändvärdet för att ändra skalan",
      plotAccessibleTitle: "Diagram över bollens bana",
      plotAccessibleDescription: "En parabel visar bollens höjd över marken som funktion av det horisontella avståndet.",
      play: "Spela upp",
      pause: "Pausa",
      resume: "Fortsätt",
      replay: "Spela igen",
      reset: "Börja om",
      axisDialogTitle: "Ändra axelns maxvärde",
      xAxisMaximum: "Maxvärde på x-axeln",
      yAxisMaximum: "Maxvärde på y-axeln",
      axisPositiveError: "Ange ett tal som är större än noll.",
      save: "Spara",
      cancel: "Avbryt",
      controlsTitle: "Pröva själv",
      controlsIntro: "Dra i reglagen. Observera både diagrammet och de beräknade värdena.",
      speedLabel: "Utgångshastighet, v₀",
      angleLabel: "Kastvinkel, θ",
      gravityLabel: "Tyngdacceleration, g",
      assumptionsTitle: "Vår modell",
      assumptions: [
        "Luftmotståndet försummas.",
        "Tyngdaccelerationen är konstant.",
        "Bollen startar och landar på samma höjd."
      ],
      resultsTitle: "Resultat",
      flightTimeLabel: "Flygtid",
      rangeLabel: "Räckvidd",
      maxHeightLabel: "Maxhöjd",
      seconds: "sekunder (s)",
      metres: "meter (m)",
      modelTitle: "Modellen bakom diagrammet",
      modelIntro: "Rörelsen delas upp i horisontell och vertikal riktning. Hastigheten är konstant horisontellt, medan tyngdkraften ändrar den vertikala hastigheten.",
      equations: [
        {
          description: "x av t är lika med v noll gånger cosinus theta gånger t",
          math: "<mi>x</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><msub><mi>v</mi><mn>0</mn></msub><mo>cos</mo><mo>(</mo><mi>θ</mi><mo>)</mo><mo>·</mo><mi>t</mi>"
        },
        {
          description: "y av t är lika med v noll sinus theta gånger t minus en halv gånger g gånger t i kvadrat",
          math: "<mi>y</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><msub><mi>v</mi><mn>0</mn></msub><mo>sin</mo><mo>(</mo><mi>θ</mi><mo>)</mo><mo>·</mo><mi>t</mi><mo>−</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mi>g</mi><msup><mi>t</mi><mn>2</mn></msup>"
        },
        {
          description: "T är lika med två gånger v noll gånger sinus theta dividerat med g",
          math: "<mi>T</mi><mo>=</mo><mfrac><mrow><mn>2</mn><msub><mi>v</mi><mn>0</mn></msub><mo>sin</mo><mo>(</mo><mi>θ</mi><mo>)</mo></mrow><mi>g</mi></mfrac>"
        }
      ],
      challengeEyebrow: "Undersök",
      challengeTitle: "Vad påverkar räckvidden mest?",
      challenges: [
        "Undersök vinklarna 30° och 60°. Vad upptäcker du?",
        "Vilken vinkel ger störst räckvidd när v₀ är oförändrad?",
        "Fördubbla hastigheten. Hur förändras räckvidden?"
      ],
      answerTitle: "Visa ledtrådar",
      answer: "30° och 60° ger samma räckvidd. Utan luftmotstånd är 45° optimal när start- och landningshöjd är lika. Vid oförändrad vinkel blir räckvidden fyra gånger större när hastigheten fördubblas.",
      footer: "Förenklad modell för fysikundervisning · Alla beräkningar sker i din webbläsare."
    }
  };
})(window);
