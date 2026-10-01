# Projektilrörelse

Det här projektet ska bli en interaktiv fysik-illustration som visar hur projektilrörelse fungerar. Målet är att kombinera tydlig visualisering med enkel interaktion så att användaren kan utforska hur olika startvärden påverkar banan genom luften.

## Syfte

Illustrationen ska göra det lättare att förstå sambandet mellan:

- starthastighet
- uppskjutningsvinkel
- gravitation
- räckvidd
- maxhöjd
- flygtid

Användaren ska kunna ändra parametrar och direkt se hur kurvan förändras.

## Planerad funktionalitet

- Interaktiv bana för ett kastat objekt i två dimensioner
- Reglage eller inmatningsfält för hastighet och vinkel
- Visning av viktiga fysikaliska storheter i realtid
- Animation av objektets rörelse
- Möjlighet att återställa värden och testa nya scenarier

## Fysik i fokus

En enkel modell för projektilrörelse utan luftmotstånd kan beskrivas med:

$$
x(t) = v_0 \cos(\theta) \cdot t
$$

$$
y(t) = v_0 \sin(\theta) \cdot t - \frac{1}{2}gt^2
$$

där:

- $v_0$ är starthastigheten
- $\theta$ är uppskjutningsvinkeln
- $g$ är tyngdaccelerationen
- $t$ är tiden

## Målbild

Projektet ska kännas pedagogiskt, visuellt tydligt och lätt att bygga vidare på. Illustrationens gränssnitt bör hjälpa användaren att experimentera snarare än att bara visa ett färdigt resultat.

## Förslag på nästa steg

1. Skapa en enkel sida som visar koordinatsystem och bana.
2. Lägg till kontroller för hastighet och vinkel.
3. Beräkna flygtid, maxhöjd och räckvidd.
4. Animera projektilens rörelse längs kurvan.
5. Förfina layout och pedagogiska texter.

## Projektstatus

Projektet är under uppstart. README:n fungerar som en gemensam riktning för den första implementationen.