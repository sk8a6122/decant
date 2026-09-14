'use client';
import React from 'react';
// The existing reader slot now presents grape guides; map data in older notebooks is ignored.
type Props={courseId?:string;lessonIndex?:number;focus?:string};
type Guide={name:string;sources:string[][];rows:[string,string,number[]][]};
const REGION_GRAPES:Record<string,Guide>={
  "california": {
    "name": "California",
    "sources": [
      [
        "Napa Valley Vintners",
        "https://napavalley.wine/"
      ],
      [
        "Sonoma County Vintners",
        "https://sonomawine.com/appellations/"
      ],
      [
        "Paso Robles Wine Country",
        "https://pasowine.com/"
      ],
      [
        "Santa Barbara Vintners",
        "https://sbcountywines.com/"
      ]
    ],
    "rows": [
      [
        "Napa Valley",
        "Cabernet Sauvignon, Merlot, Chardonnay, Sauvignon Blanc",
        [
          1
        ]
      ],
      [
        "Carneros (Napa and Sonoma)",
        "Pinot Noir, Chardonnay",
        [
          1,
          2
        ]
      ],
      [
        "Alexander Valley",
        "Cabernet Sauvignon, Merlot",
        [
          2
        ]
      ],
      [
        "Dry Creek Valley",
        "Zinfandel, Sauvignon Blanc",
        [
          2
        ]
      ],
      [
        "Russian River Valley",
        "Pinot Noir, Chardonnay",
        [
          2
        ]
      ],
      [
        "Sonoma Coast and Petaluma Gap",
        "Pinot Noir, Chardonnay, Syrah",
        [
          2
        ]
      ],
      [
        "Monterey and Santa Lucia Highlands",
        "Pinot Noir, Chardonnay",
        [
          3
        ]
      ],
      [
        "Paso Robles",
        "Cabernet Sauvignon, Zinfandel, Syrah, Grenache, Viognier",
        [
          3
        ]
      ],
      [
        "Santa Maria Valley and Sta. Rita Hills",
        "Pinot Noir, Chardonnay",
        [
          3
        ]
      ],
      [
        "Happy Canyon",
        "Cabernet Sauvignon, Cabernet Franc, Merlot, Sauvignon Blanc",
        [
          3
        ]
      ],
      [
        "North Coast",
        "Cabernet Sauvignon, Pinot Noir, Chardonnay, Zinfandel",
        [
          4
        ]
      ],
      [
        "Central Coast",
        "Pinot Noir, Chardonnay, Cabernet Sauvignon, Syrah",
        [
          4
        ]
      ],
      [
        "Central Valley, including Lodi",
        "Zinfandel, Cabernet Sauvignon, Chardonnay, Petite Sirah",
        [
          4
        ]
      ],
      [
        "South Coast, including Temecula",
        "Cabernet Sauvignon, Syrah, Sangiovese, Viognier",
        [
          4
        ]
      ]
    ]
  },
  "oregon": {
    "name": "Oregon",
    "sources": [
      [
        "Oregon Wine Board",
        "https://www.oregonwine.org/regions/avas/"
      ]
    ],
    "rows": [
      [
        "Willamette Valley",
        "Pinot Noir, Chardonnay, Pinot Gris, Riesling",
        [
          1
        ]
      ],
      [
        "Dundee Hills",
        "Pinot Noir, Chardonnay",
        [
          1
        ]
      ],
      [
        "Eola-Amity Hills",
        "Pinot Noir, Chardonnay",
        [
          1
        ]
      ],
      [
        "Van Duzer Corridor",
        "Pinot Noir, Pinot Gris, Chardonnay",
        [
          1
        ]
      ],
      [
        "Umpqua Valley",
        "Pinot Noir, Pinot Gris, Syrah, Tempranillo",
        [
          2
        ]
      ],
      [
        "Elkton Oregon",
        "Pinot Noir, Pinot Gris, Gewürztraminer, Riesling",
        [
          2
        ]
      ],
      [
        "Rogue Valley",
        "Syrah, Cabernet Sauvignon, Merlot, Tempranillo, Viognier",
        [
          2
        ]
      ],
      [
        "Applegate Valley",
        "Merlot, Cabernet Sauvignon, Syrah",
        [
          2
        ]
      ],
      [
        "Columbia Gorge — cooler western sites",
        "Pinot Noir, Chardonnay, Pinot Gris, Riesling",
        [
          3
        ]
      ],
      [
        "Columbia Gorge — warmer eastern sites",
        "Syrah, Cabernet Sauvignon, Zinfandel",
        [
          3
        ]
      ]
    ]
  },
  "new-york": {
    "name": "New York",
    "sources": [
      [
        "New York Wine & Grape Foundation",
        "https://newyorkwines.org/grapes/"
      ]
    ],
    "rows": [
      [
        "Finger Lakes",
        "Riesling, Cabernet Franc, Chardonnay, Pinot Noir, Gewürztraminer",
        [
          1
        ]
      ],
      [
        "Seneca Lake and Cayuga Lake",
        "Riesling, Cabernet Franc, Chardonnay",
        [
          1
        ]
      ],
      [
        "Long Island and North Fork",
        "Merlot, Cabernet Franc, Cabernet Sauvignon, Chardonnay, Sauvignon Blanc",
        [
          2
        ]
      ],
      [
        "The Hamptons, Long Island",
        "Merlot, Chardonnay, Cabernet Franc",
        [
          2
        ]
      ],
      [
        "Hudson River Region",
        "Cabernet Franc, Chardonnay, Seyval Blanc, Baco Noir",
        [
          3
        ]
      ],
      [
        "Upper Hudson",
        "Marquette, Frontenac, La Crescent",
        [
          3
        ]
      ],
      [
        "Champlain Valley of New York",
        "Marquette, Frontenac, La Crescent",
        [
          3
        ]
      ],
      [
        "Lake Erie",
        "Concord, Niagara, Catawba, Riesling",
        [
          4
        ]
      ],
      [
        "Niagara Escarpment",
        "Cabernet Franc, Riesling, Chardonnay, Pinot Noir",
        [
          4
        ]
      ]
    ]
  },
  "south-africa": {
    "name": "South Africa",
    "sources": [
      [
        "Wines of South Africa",
        "https://www.wosa.co.za/The-Industry/Winegrowing-Areas/Winelands-of-South-Africa/"
      ]
    ],
    "rows": [
      [
        "Stellenbosch",
        "Cabernet Sauvignon, Merlot, Pinotage, Chenin Blanc",
        [
          1
        ]
      ],
      [
        "Constantia",
        "Sauvignon Blanc, Sémillon, Muscat de Frontignan",
        [
          1
        ]
      ],
      [
        "Paarl",
        "Chenin Blanc, Shiraz, Cabernet Sauvignon",
        [
          1
        ]
      ],
      [
        "Franschhoek Valley",
        "Sémillon, Chardonnay, Cabernet Sauvignon",
        [
          1
        ]
      ],
      [
        "Wellington",
        "Chenin Blanc, Pinotage, Shiraz",
        [
          1
        ]
      ],
      [
        "Swartland",
        "Chenin Blanc, Syrah, Grenache, Cinsaut",
        [
          2
        ]
      ],
      [
        "Darling",
        "Sauvignon Blanc, Shiraz, Pinotage",
        [
          2
        ]
      ],
      [
        "Elgin",
        "Chardonnay, Pinot Noir, Sauvignon Blanc, Riesling",
        [
          3
        ]
      ],
      [
        "Walker Bay and Hemel-en-Aarde",
        "Pinot Noir, Chardonnay",
        [
          3
        ]
      ],
      [
        "Cape Agulhas / Elim",
        "Sauvignon Blanc, Sémillon, Shiraz",
        [
          3
        ]
      ],
      [
        "Bot River",
        "Chenin Blanc, Sauvignon Blanc, Pinotage, Shiraz",
        [
          3
        ]
      ],
      [
        "Breedekloof and Worcester",
        "Chenin Blanc, Colombard, Pinotage",
        [
          4
        ]
      ],
      [
        "Robertson",
        "Chardonnay, Sauvignon Blanc, Shiraz",
        [
          4
        ]
      ],
      [
        "Klein Karoo / Calitzdorp",
        "Touriga Nacional, Tinta Barroca, Muscat",
        [
          4
        ]
      ],
      [
        "Olifants River",
        "Chenin Blanc, Colombard, Sauvignon Blanc",
        [
          4
        ]
      ],
      [
        "Cederberg",
        "Sauvignon Blanc, Shiraz, Chenin Blanc",
        [
          4
        ]
      ]
    ]
  }
};
function renderRegionalGrapes(h:typeof React.createElement,props:Props){
 if(!props.courseId)return null;

 const course=REGION_GRAPES[props.courseId];
 if(!course)return null;
 const specific=course.rows.filter(row=>row[2].includes(props.lessonIndex ?? -1));
 const rows=specific.length?specific:course.rows;
 return h('section',{'aria-label':course.name+' grape varieties',style:{margin:'0 0 28px',padding:'22px',border:'1px solid #d3d7c7',borderRadius:5,background:'#eff1e7'}},
 h('p',{style:{fontSize:10,letterSpacing:2,color:'#773f50',margin:'0 0 8px'}},course.name.toUpperCase()+' / GRAPES TO KNOW'),
 h('h3',{style:{font:'25px/1.25 Georgia,serif',margin:'0 0 12px'}},'Key grape varieties'),
 h('p',{style:{fontSize:13,lineHeight:1.6,margin:'0 0 18px'}},'Useful varieties to recognize, not an exhaustive list or a guarantee of style.'),
 h('dl',{style:{margin:0}},...rows.map(row=>h('div',{key:row[0],style:{padding:'12px 0',borderTop:'1px solid #d3d7c7'}},
 h('dt',{style:{fontWeight:600,fontSize:14}},row[0]),h('dd',{style:{margin:'5px 0 0',fontSize:14,lineHeight:1.65,overflowWrap:'anywhere'}},row[1])))),
 props.courseId==='new-york'?h('p',{style:{fontSize:12,margin:'16px 0 0'}},'Native and hybrid grapes belong here too: Concord is native; Marquette, Frontenac and La Crescent are cold-hardy hybrids.'):null,
 props.courseId==='south-africa'?h('p',{style:{fontSize:12,margin:'16px 0 0'}},'Syrah and Shiraz are the same grape. Calitzdorp is especially associated with fortified wines from Portuguese varieties.'):null,
 h('details',{style:{fontSize:12,marginTop:16}},h('summary',{style:{cursor:'pointer'}},'Regional sources'),
 ...course.sources.map(source=>h('a',{key:source[1],href:source[1],target:'_blank',rel:'noopener noreferrer',style:{display:'block',marginTop:8,textDecoration:'underline'}},source[0]))));

}
export function RegionMap(props:Props){return renderRegionalGrapes(React.createElement,props);}
export default RegionMap;
