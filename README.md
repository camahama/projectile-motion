# Kaströrelse

En interaktiv, fristående webbsida för gymnasiets fysikundervisning. Modellen försummar luftmotstånd, använder konstant tyngdacceleration och låter bollen starta och landa på samma höjd.

## Använd lokalt

Öppna `index.html` i en vanlig webbläsare. Ingen installation eller server behövs.

## Publicera med GitHub Pages

1. Skapa ett nytt tomt repository på GitHub.
2. Ladda upp alla filer från den här mappen till repositoryt.
3. Öppna **Settings** → **Pages** i repositoryt.
4. Välj **Deploy from a branch**.
5. Välj grenen `main`, mappen `/ (root)` och klicka på **Save**.
6. GitHub visar efter en stund adressen till webbsidan.

## Ändra innehållet

- **Fysik:** Ändra formlerna i `physics.js`.
- **Undervisningstexter och startvärden:** Ändra `texts.js`.
- **Utseende och färger:** Ändra `styles.css`.
- **Webbsidans struktur:** Ändra `index.html`.

Undvik att börja med `app.js` om du bara vill ändra fysik eller undervisningstext.

## Kontroll

För 20 m/s, 45° och 9,82 m/s² ger modellen ungefär:

- flygtid: 2,9 s
- räckvidd: 40,7 m
- maxhöjd: 10,2 m
