'use client';
import React from 'react';
type LabelGuide={name:string;producer:string;year:string;grape:string;place:string;origin:string;abv:string;emblem:string;details:string[][];takeaway:string;question:string;options:string[];answer:number;explanation:string;source:string};
const LABEL_GUIDES:Record<string,LabelGuide>={
  "california": {
    "name": "California",
    "producer": "ALDER HOUSE",
    "year": "2023",
    "grape": "CABERNET SAUVIGNON",
    "place": "OAKVILLE · NAPA VALLEY",
    "origin": "CALIFORNIA",
    "abv": "14.5%",
    "emblem": "❧",
    "details": [
      [
        "Producer",
        "Alder House is the fictional producer name. It identifies the brand, not the grape or growing region."
      ],
      [
        "Vintage",
        "2023 is the harvest year shown on this example. It is not the bottling year or a promise of quality."
      ],
      [
        "Grape",
        "Cabernet Sauvignon is the named grape variety. The label alone does not tell you oak use, texture, or whether other grapes are in the blend."
      ],
      [
        "Place",
        "Oakville is an AVA within Napa Valley. A smaller place name narrows origin; it does not rank quality."
      ]
    ],
    "takeaway": "A smaller place name narrows origin. It does not rank quality.",
    "question": "Which detail tells you the most specific growing area?",
    "options": [
      "Alder House",
      "Oakville",
      "2023"
    ],
    "answer": 1,
    "explanation": "Oakville is the narrower place name. Napa Valley is its parent AVA.",
    "source": "https://napavalley.wine/"
  },
  "oregon": {
    "name": "Oregon",
    "producer": "FERN & FIELD",
    "year": "2023",
    "grape": "PINOT NOIR",
    "place": "DUNDEE HILLS",
    "origin": "OREGON",
    "abv": "13.5%",
    "emblem": "❧",
    "details": [
      [
        "Producer",
        "Fern & Field is a fictional producer. Read the producer separately from the grape and the place."
      ],
      [
        "Vintage",
        "2023 is the harvest year on the example. Weather and producer decisions still shape the wine."
      ],
      [
        "Grape",
        "Pinot Noir is the named grape. It does not guarantee a particular weight, aroma, or amount of oak."
      ],
      [
        "Place",
        "Dundee Hills is an AVA within the Willamette Valley. The parent valley does not have to appear beside it for that geographic relationship to be true."
      ]
    ],
    "takeaway": "The AVA is on the label. The parent valley may not be.",
    "question": "Dundee Hills sits within which larger wine region?",
    "options": [
      "Rogue Valley",
      "Columbia Gorge",
      "Willamette Valley"
    ],
    "answer": 2,
    "explanation": "Dundee Hills is a nested AVA within Willamette Valley.",
    "source": "https://www.oregonwine.org/regions/willamette-valley/dundee-hills-ava/"
  },
  "new-york": {
    "name": "New York",
    "producer": "NORTH SHORE CELLARS",
    "year": "2023",
    "grape": "RIESLING",
    "place": "SENECA LAKE",
    "origin": "NEW YORK",
    "abv": "12%",
    "emblem": "≈",
    "details": [
      [
        "Producer",
        "North Shore Cellars is a fictional producer name. A lake-inspired brand name is not itself an appellation."
      ],
      [
        "Vintage",
        "2023 identifies the harvest year shown on the example, not its sweetness or the date it was bottled."
      ],
      [
        "Grape",
        "Riesling can be dry, off-dry, or sweet. Look for a sweetness indication or ask the producer; grape and alcohol level alone do not settle the question."
      ],
      [
        "Place",
        "Seneca Lake is an AVA within the Finger Lakes. It identifies origin, not one fixed flavor for every vineyard or vintage."
      ]
    ],
    "takeaway": "Riesling does not tell you sweetness. Ask: dry, off-dry, or sweet?",
    "question": "What can you NOT determine from this front label alone?",
    "options": [
      "Whether the Riesling is dry or sweet",
      "The named grape",
      "The named AVA"
    ],
    "answer": 0,
    "explanation": "Riesling is a grape, not a sweetness level. Confirm the style on the back label or with the producer.",
    "source": "https://newyorkwines.org/avas/finger-lakes/"
  },
  "south-africa": {
    "name": "South Africa",
    "producer": "CAPE THREAD",
    "year": "2023",
    "grape": "CHENIN BLANC",
    "place": "WINE OF ORIGIN STELLENBOSCH",
    "origin": "SOUTH AFRICA",
    "abv": "13%",
    "emblem": "❧",
    "details": [
      [
        "Producer",
        "Cape Thread is the fictional producer. Its name does not itself establish a certified origin."
      ],
      [
        "Vintage",
        "2023 is the harvest year stated on this example. Vintage is a separate claim from grape variety and origin."
      ],
      [
        "Grape",
        "Chenin Blanc is the named variety, also historically called Steen in South Africa. The grape can make many styles; the name alone does not tell you sweetness or oak treatment."
      ],
      [
        "Origin",
        "Wine of Origin Stellenbosch identifies the demarcated origin. On a real bottle, look for the certification seal, usually on the neck, to verify certified label claims."
      ]
    ],
    "takeaway": "Look for the certification seal on the bottle neck.",
    "question": "Where would you look next to check the certified label claims?",
    "options": [
      "The producer's decorative artwork",
      "A price sticker",
      "The certification seal on the bottle neck"
    ],
    "answer": 2,
    "explanation": "The certification seal supports the certified origin, cultivar, and vintage claims. This fictional front label does not reproduce a seal.",
    "source": "https://www.wosa.co.za/The-Industry/Wines-Of-Origin/Wine-Of-Origin-scheme/"
  }
};
const LABEL_CSS="\n.label-reader{margin:0 0 28px;color:#303d32}\n.label-reader-heading>p:first-child{font:10px/1.6 Arial,sans-serif;letter-spacing:2px;color:#79394c;margin:0 0 9px}\n.label-reader-heading h3{font:30px/1.2 Georgia,serif;margin:0 0 12px}\n.label-reader-heading>p:last-child{font-size:14px;margin:0 0 22px}\n.label-reader-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px;align-items:start}\n.label-paper{background:linear-gradient(135deg,#fffdf6,#eee8d8);border:1px solid #bbab89;outline:1px solid #d6c9ac;outline-offset:-7px;padding:27px 18px 24px;text-align:center;box-shadow:0 4px 12px #41342112;min-width:0}\n.label-emblem{font:55px/1 Georgia,serif;color:#7d8a69;margin:5px 0 18px}\n.label-field{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:46px;padding:9px 3px;margin:5px 0;border-radius:3px;border:1px solid transparent;text-align:center}\n.label-field>span:last-child{min-width:0;overflow-wrap:anywhere;letter-spacing:1.2px;font:13px/1.5 Georgia,serif}\n.label-field-0>span:last-child{font-size:clamp(20px,2.2vw,28px);letter-spacing:0}\n.label-field-1>span:last-child{font-size:17px;letter-spacing:3px}\n.label-field[aria-pressed=true]{background:#79394c0c;border-color:#b68c98}\n.label-badge{display:inline-flex;align-items:center;justify-content:center;width:25px;height:25px;flex:0 0 25px;border-radius:50%;background:#79394c;color:#fff;font:14px Georgia,serif}\n.label-bottle-meta{font:10px/1.8 Arial,sans-serif!important;letter-spacing:.8px;margin:20px 0 0!important;color:#586151}\n.label-detail-tabs{display:flex;flex-wrap:wrap;gap:6px}\n.label-detail-tabs button{display:flex;align-items:center;gap:7px;min-height:44px;padding:6px 9px;border:1px solid #d4cec0;border-radius:4px;font-size:12px}\n.label-detail-tabs button[aria-pressed=true]{background:#e4e9d9;border-color:#8b9b78}\n.label-detail-copy{padding:20px 0;min-height:145px}\n.label-detail-copy h4{font:23px Georgia,serif;margin:0 0 10px}\n.label-detail-copy p{font:14px/1.75 Arial,sans-serif;margin:0}\n.label-takeaway{padding:18px;background:#e4e9d9;border-left:3px solid #8b9b78;font:18px/1.55 Georgia,serif;margin:0}\n.label-fiction{font:11px/1.6 Arial,sans-serif;color:#747264;margin:15px 0 23px}\n.label-practice{min-width:0;border:1px solid #d7cdbb;padding:18px;margin:0;background:#fffdf6}\n.label-practice legend{font:21px Georgia,serif;padding:0 7px}\n.label-practice>p{font-size:14px;margin:0 0 12px}\n.label-answer{display:block;width:100%;text-align:left;border:1px solid #d7cdbb;border-radius:4px;padding:12px;margin:8px 0;min-height:46px;font-size:14px}\n.label-answer[aria-pressed=true]{border-color:#79394c;background:#f1e4e8}\n.label-feedback{font-size:14px;line-height:1.6;color:#435b37;margin-top:12px}\n.label-practice .label-practice-note{font-size:11px;line-height:1.6;margin:14px 0 0;color:#767363}\n.label-source{display:inline-block;font-size:12px;text-decoration:underline;margin-top:14px}\n.label-reader button:focus-visible,.label-source:focus-visible{outline:2px solid #79394c;outline-offset:3px}\n@media(max-width:900px){.label-reader-grid{grid-template-columns:minmax(0,1fr)}.label-paper{max-width:390px;width:100%;margin:auto}.label-detail-copy{min-height:0}.label-field-0>span:last-child{font-size:26px}.label-reader-heading h3{font-size:27px}}\n";
export function LabelReading(props:{courseId:string}){

 const [active,setActive]=React.useState(0);
 const [choice,setChoice]=React.useState<number|null>(null);
 const guide=LABEL_GUIDES[props.courseId];
 if(!guide)return null;
 const h=React.createElement;
 const values=[guide.producer,guide.year,guide.grape,guide.place];
 const badge=(index:number)=>h('span',{className:'label-badge','aria-hidden':true},index+1);
 return h('section',{className:'label-reader','aria-label':'Read a '+guide.name+' wine label'},
 h('style',null,LABEL_CSS),
 h('header',{className:'label-reader-heading'},h('p',null,guide.name.toUpperCase()+' / LABEL LITERACY'),h('h3',null,'The label is a starting point.'),h('p',null,'Tap a numbered detail to learn what it tells you.')),
 h('div',{className:'label-reader-grid'},
 h('div',{className:'label-paper'},
 h('div',{className:'label-emblem','aria-hidden':true},guide.emblem),
 ...values.map((value,index)=>h('button',{key:index,type:'button',className:'label-field label-field-'+index,'aria-pressed':active===index,'aria-label':guide.details[index][0]+': '+value,onClick:()=>setActive(index)},badge(index),h('span',null,value))),
 h('p',{className:'label-bottle-meta'},guide.origin+' · 750 ml · '+guide.abv+' alc/vol')),
 h('div',{className:'label-explanation'},
 h('div',{className:'label-detail-tabs',role:'group','aria-label':'Label details'},...guide.details.map((detail,index)=>h('button',{key:index,type:'button','aria-pressed':active===index,onClick:()=>setActive(index)},badge(index),detail[0]))),
 h('div',{className:'label-detail-copy','aria-live':'polite','aria-atomic':true},h('h4',null,guide.details[active][0]),h('p',null,guide.details[active][1])),
 h('p',{className:'label-takeaway'},guide.takeaway))),
 h('p',{className:'label-fiction'},'Illustrative label · Fictional producer. Real bottles may split this information across the front and back.'),
 props.courseId==='south-africa'?h('aside',{className:'label-practice','aria-label':'Wine Certification Authority'},
 h('h4',null,'Wine Certification Authority (WCA)'),
 h('p',null,'The WCA administers South Africa’s Wine of Origin scheme. Its certification seal verifies the certified origin, grape variety (cultivar), and vintage claims on a bottle.'),
 h('p',null,'Look for the numbered seal, usually on the bottle neck. Certification includes analytical and sensory evaluation; it is not a critic score or a ranking of wine regions.'),
 h('p',null,'SAWIS carries out day-to-day scheme operations for the Authority, including inspections, sampling, and issuing certification seals.'),
 h('a',{href:'https://www.wosa.co.za/The-Industry/Wines-Of-Origin/Wine-and-Spirit-Board/',target:'_blank',rel:'noopener noreferrer',className:'label-source'},'Read about the WCA and certification ↗')):null,
 h('fieldset',{className:'label-practice'},h('legend',null,'Try reading the label'),h('p',null,guide.question),
 ...guide.options.map((option,index)=>h('button',{key:index,type:'button','aria-pressed':choice===index,onClick:()=>setChoice(index),className:'label-answer'},option)),
 h('div',{'aria-live':'polite','aria-atomic':true,className:'label-feedback'},choice===null?'':choice===guide.answer?'Correct. '+guide.explanation:'Not quite. '+guide.explanation),
 h('p',{className:'label-practice-note'},'Practice only. Complete the lesson’s knowledge check below to save your progress.')),
 h('a',{href:guide.source,target:'_blank',rel:'noopener noreferrer',className:'label-source'},'Explore the regional reference ↗'));

}
