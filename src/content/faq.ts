// Časté dotazy. Odpovede stoja len na faktoch z webu a z cenníka v databáze (ceny sa berú z price_list,
// aby sa FAQ nerozišlo s cenníkom).
import type { Language } from '../App';
import type { PriceListItem } from '../lib/supabase';
import { BUSINESS, ADDRESS_LINE, openingHoursSentence } from '../lib/business';
import { findPrice, formatPrice } from '../lib/siteData';

export type FaqItem = { q: string; a: string };

// TODO(klient): S kterými zdravotními pojišťovnami má ordinace smlouvu? Doplnit otázku
// „S kterými pojišťovnami spolupracujete?“ až po potvrzení – nevymýšlet.
// TODO(klient): Parkování u ordinace, bezbariérový přístup, akutní ošetření bez objednání – nemáme ověřené údaje.

const join = (parts: (string | null | false)[]) => parts.filter(Boolean).join(' ');

export function buildFaq(language: Language, priceList: PriceListItem[]): FaqItem[] {
  const p = (prefix: string) => {
    const raw = findPrice(priceList, prefix);
    return raw ? formatPrice(raw, language) : null;
  };

  const consult = p('Návrh terapie');
  const hygieneAdult = p('Vstupní ošetření dentální hygienistkou - dospělý');
  const hygieneChild = p('Vstupní ošetření dentální hygienistkou - dítě');
  const recall = p('Opakované ošetření');
  const implant = p('Zubní implantát');
  const implantCrown = p('Korunka na implantát');
  const whiteningOffice = p('Bělení zubů - Ordinační');
  const whiteningHome = p('Bělení zubů - Domácí');
  const whiteningCombined = p('Bělení zubů - Kombinované');
  const covered = priceList
    .filter((i) => i.price_string.trim() === 'Hrazeno ZP')
    .map((i) => i.service_name.trim());

  if (language === 'en') {
    return [
      {
        q: 'Does DK KRÁL accept new patients?',
        a: join([
          'Yes, we accept new patients, especially for dental hygiene.',
          consult && `Before accepting you into regular care we prepare a treatment plan with an initial consultation and photo documentation (${consult}).`,
        ]),
      },
      {
        q: 'How do I book an appointment?',
        a: `Call ${BUSINESS.phoneDisplay} or email ${BUSINESS.email}. If you cannot get through, please send a text message to the same number.`,
      },
      {
        q: 'Where is the DK KRÁL dental clinic in Hradec Králové?',
        a: `The clinic is located at ${ADDRESS_LINE}, in the centre of Hradec Králové.`,
      },
      { q: 'What are the opening hours?', a: `${openingHoursSentence('en')}.` },
      {
        q: 'How much does dental hygiene cost?',
        a: join([
          hygieneAdult && `Initial dental hygiene treatment costs ${hygieneAdult} for adults`,
          hygieneChild ? `and ${hygieneChild} for children under 15.` : hygieneAdult && '.',
          recall && `A follow-up (RECALL) treatment costs ${recall}.`,
        ]),
      },
      ...(covered.length
        ? [{
            q: 'Which treatments are covered by health insurance?',
            a: `According to the current price list, these are covered by public health insurance: ${covered.join(', ')}. Prices of other treatments are listed in the price list.`,
          }]
        : []),
      {
        q: 'How much does a dental implant cost?',
        a: join([
          implant && `A dental implant costs ${implant}`,
          implantCrown ? `and a crown on the implant ${implantCrown}.` : implant && '.',
          'The final price is set after the initial consultation and depends on the scope of treatment.',
        ]),
      },
      {
        q: 'How much does teeth whitening cost?',
        a: join([
          'We offer in-office, home and combined whitening.',
          whiteningOffice && `In-office: ${whiteningOffice}.`,
          whiteningHome && `Home: ${whiteningHome}.`,
          whiteningCombined && `Combined: ${whiteningCombined}.`,
        ]),
      },
    ];
  }

  return [
    {
      q: 'Přijímáte nové pacienty?',
      a: join([
        'Ano, DK KRÁL přijímá nové pacienty, zejména na dentální hygienu.',
        consult && `Před přijetím do pravidelné péče připravíme návrh terapie s úvodní konzultací a fotodokumentací (${consult}).`,
      ]),
    },
    {
      q: 'Jak se k zubaři DK KRÁL objednat?',
      a: `Zavolejte na ${BUSINESS.phoneDisplay} nebo napište na ${BUSINESS.email}. Pokud se nedovoláte, pošlete prosím SMS na stejné číslo.`,
    },
    {
      q: 'Kde najdu zubní ordinaci DK KRÁL v Hradci Králové?',
      a: `Ordinace sídlí na adrese ${ADDRESS_LINE}, v centru Hradce Králové.`,
    },
    { q: 'Jaké máte ordinační hodiny?', a: `${openingHoursSentence('cs')}.` },
    {
      q: 'Kolik stojí dentální hygiena?',
      a: join([
        hygieneAdult && `Vstupní ošetření dentální hygienistkou stojí pro dospělé ${hygieneAdult}`,
        hygieneChild ? `a pro děti do 15 let ${hygieneChild}.` : hygieneAdult && '.',
        recall && `Opakované ošetření (RECALL) stojí ${recall}.`,
      ]),
    },
    ...(covered.length
      ? [{
          q: 'Které výkony hradí zdravotní pojišťovna?',
          a: `Podle aktuálního ceníku jsou z veřejného zdravotního pojištění hrazeny: ${covered.join(', ')}. Ceny ostatních výkonů najdete v ceníku.`,
        }]
      : []),
    {
      q: 'Kolik stojí zubní implantát?',
      a: join([
        implant && `Zubní implantát stojí ${implant}`,
        implantCrown ? `a korunka na implantát ${implantCrown}.` : implant && '.',
        'Finální cenu stanovíme po vstupní konzultaci podle rozsahu ošetření.',
      ]),
    },
    {
      q: 'Kolik stojí bělení zubů?',
      a: join([
        'Nabízíme ordinační, domácí a kombinované bělení.',
        whiteningOffice && `Ordinační: ${whiteningOffice}.`,
        whiteningHome && `Domácí: ${whiteningHome}.`,
        whiteningCombined && `Kombinované: ${whiteningCombined}.`,
      ]),
    },
  ];
}
