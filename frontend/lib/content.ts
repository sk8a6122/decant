export type Lesson={title:string;body:string;map?:string;question?:string;options?:string[];answer?:number};
export type Education={id:string;kind:'article'|'course';title:string;summary:string;category:string;tier:number;status:string;body:Lesson[];regions?:string[];grapes?:string[];updated_at?:string;locked?:boolean;lessonCount?:number};
export const initialContent:Education[]=[
{id:'wine-foundations',kind:'course',title:'Find your palate',summary:'A practical introduction to tasting, without the intimidating vocabulary.',category:'Foundations',tier:0,status:'published',body:[
{title:'Start with what you notice',body:'You do not need a perfect vocabulary to keep a useful tasting note. Start with a quiet moment and write three observations: what you smell, how the wine feels, and whether you enjoy it.\n\nTry this: choose a familiar aroma, such as lemon peel or fresh berries. Smell it first, then smell your glass. The point is to make your own associations, not to find the correct answer.\n\nYour notebook prompt: “This reminds me of …” Keep your first impression. Taste preferences can change with food, temperature, and company.',question:'What is the most useful starting point for a personal tasting note?',options:['An impressive technical term','An honest observation in your own words','The price of the bottle'],answer:1},
{title:'Separate acidity from tannin',body:'Acidity makes your mouth water. Tannin creates a drying sensation around the gums. These are different feelings, even when both are present.\n\nTake a small sip. After swallowing or spitting, notice whether your mouth waters or feels dry. Describe each sensation separately: low, medium, or high is enough.\n\nPractice prompt: compare your notes from two wines on different occasions. You do not need to open extra bottles to learn.\n\nFurther reading: https://www.wsetglobal.com/knowledge-center/blog/2026/the-secret-language-of-wine-what-is-mouthfeel',question:'Which sensation is most associated with tannin?',options:['Mouth-watering freshness','A drying feeling on the gums','Bubbles'],answer:1},
{title:'Build a note you will use again',body:'A useful note helps future you choose a bottle. Record the producer, wine name, vintage if shown, date, and one or two observations. Finish with the occasion and a simple decision: would you drink it again?\n\nTry this template: “I noticed ___. With food it felt ___. I would open this again for ___.”\n\nLeave room for uncertainty. “Maybe citrus” is more useful than copying a description that does not match your experience. Revisit a note the next time you encounter the wine.',question:'Which detail makes a tasting note useful later?',options:['A personal occasion or food match','Only the label color','Someone else’s score'],answer:0}]},
{id:'california',kind:'course',title:'California, from the fog in',summary:'One weather pattern explains most of the state. Learn it and the map starts making sense.',category:'Regions',tier:0,status:'published',regions:['California','Napa Valley','Sonoma','Sonoma County','Russian River Valley','Sonoma Coast','Alexander Valley','Dry Creek Valley','Carneros','Central Coast','Monterey','Santa Lucia Highlands','Paso Robles','Santa Barbara','Santa Maria Valley','Sta. Rita Hills','Napa','California Central Coast'],grapes:['Cabernet Sauvignon','Chardonnay','Pinot Noir','Zinfandel','Merlot','Sauvignon Blanc','Syrah','Grenache','Petite Sirah'],body:[

{title:'It all comes back to the fog',map:'fog',body:'California sits next to a very cold ocean. The current running down the coast is cold enough that on a July afternoon the water off San Francisco can be in the low fifties. Inland, the valleys bake. Hot air rises over the interior, cool marine air gets pulled in to replace it, and where the coastal mountains have a gap, that air pours through.\n\nThat is the whole engine. Not latitude, which is what most of us reach for first. A vineyard three hours south of another one can be considerably cooler, because it sits in front of a gap and the other sits behind a ridge.\n\nSo when you see a California region on a label, the useful question is not how far north it is. It is how much marine air gets in, and how quickly the fog burns off in the morning. Fog in the morning and wind in the afternoon means the grapes hold their acidity while they ripen, which is why the coolest California sites can make wines that taste nothing like the sunny stereotype.\n\nThe state makes roughly nine out of every ten bottles of American wine, across four broad zones: the North Coast, the Central Coast, the South Coast, and the enormous Central Valley inland, which grows most of the volume you find at everyday prices.',question:'What most determines how cool a California vineyard is?',options:['How far north it sits','How much cold marine air reaches it','How high the vines are trained'],answer:1},

{title:'Napa, and why Cabernet',map:'napa',body:'Napa is a narrow valley, about thirty miles long, with mountains on both sides and San Pablo Bay at the southern end. Cool air comes up from the bay, so the south end near Carneros is genuinely cool and the north end around Calistoga is properly hot. You can drive that gradient in under an hour.\n\nCabernet Sauvignon is a late-ripening grape that needs real heat to lose its green edge, and needs that heat to arrive reliably every year. Napa provides both, which is the honest reason it became Cabernet country. The valley floor gives richer, softer wines. The benchlands where the hillsides meet the floor drain better and tend to give more structure. Mountain fruit from Howell Mountain or Mount Veeder, above the fog line, gets more sun and cooler nights, and usually shows firmer tannin.\n\nExpect dark fruit, cassis and blackberry, often cedar or vanilla from oak, and tannin that is ripe rather than grippy. Alcohol usually sits on the higher side.\n\nBe ready for the prices. Land in Napa is some of the most expensive farmland in the country, and that is in the bottle before anyone talks about quality. Plenty of the value in California is elsewhere.',question:'Why did Cabernet Sauvignon become Napa’s signature grape?',options:['It is the only grape that grows there','It ripens late and Napa reliably delivers the heat it needs','It was the first grape planted in California'],answer:1},

{title:'Sonoma, which is not one place',map:'sonoma',body:'Sonoma County is much bigger than Napa and far more varied, so treating it as a single style will mislead you every time. It runs from the cold Pacific coast to warm inland valleys and holds around nineteen AVAs.\n\nThe Russian River Valley pulls fog inland through the river’s course, which keeps it cool and makes it one of the country’s better addresses for Pinot Noir and Chardonnay. Carneros, shared with Napa at the southern end, is cool for the same reason Napa’s south end is. The Sonoma Coast is colder still.\n\nThe Petaluma Gap is worth knowing by name. It is a genuine break in the coastal hills that funnels wind, not just fog, and wind slows ripening in its own right. Wines from there tend to be taut.\n\nInland it warms up fast. Dry Creek Valley is old-vine Zinfandel country, brambly and peppery. Alexander Valley grows Cabernet in a softer, more approachable register than Napa. Sonoma Valley sits in between in both geography and style.\n\nIf a bottle just says Sonoma County, you are getting an average of all of that. The sub-AVA is where the information is.',question:'A wine is labeled Russian River Valley. What does the fog tell you to expect?',options:['A cooler site, with acidity retained','A hotter site, with softer acidity','Nothing, fog does not affect ripening'],answer:0},

{title:'The Central Coast, where the value lives',map:'central-coast',body:'Head south and the coast keeps working the same trick in different ways.\n\nMonterey has the Salinas Valley, which opens straight at the ocean and acts like a wind tunnel. The northern end is cold and windy enough that ripening is a real challenge. The Santa Lucia Highlands sit on terraces above the valley floor, catching sun in the morning and wind in the afternoon, and make some of the state’s best Pinot Noir and Chardonnay.\n\nPaso Robles is warm by day and startlingly cool at night, a swing of forty degrees or more in summer. That gap is what keeps the acidity in wines that would otherwise be jammy. It holds eleven sub-AVAs across a big area, and the west side toward the coast is cooler and rockier than the east. Cabernet is planted widely, but Paso really made its name on Rhone grapes: Syrah, Grenache, Mourvedre, and blends of them, plus Zinfandel.\n\nSanta Barbara has the geography that surprises people. Its mountain ranges run east to west rather than north to south, which is rare, and the valleys between them open directly to the ocean. Cold air funnels straight inland, so the Santa Maria Valley and the western end of the Sta. Rita Hills are cold, and it warms steadily as you move east until you reach Happy Canyon, which is warm enough for Bordeaux grapes. Cool Pinot Noir, Chardonnay and Syrah on one end of a valley and Cabernet on the other, all in one county.\n\nIf Napa prices put you off, this is where to shop.',question:'What keeps acidity in Paso Robles wines despite the daytime heat?',options:['Constant coastal fog all day','A large drop in temperature overnight','Picking the grapes before they ripen'],answer:1},

{title:'What California does to the grapes',map:'zones',body:'Sunshine is reliable here in a way it is not in most of Europe, and that shows up in the glass. Riper fruit, fuller body, usually higher alcohol. It is a difference of degree, not of quality.\n\nCabernet Sauvignon reads as cassis and blackberry rather than the leafier, more savory register of Bordeaux, with rounder tannins. Chardonnay covers the full range: lean and citrusy from cold coastal sites, and rich, buttery and oaky in the style that made California famous in the eighties. Both exist today and neither is wrong. Pinot Noir tends toward darker fruit, cherry and cola, with more weight than red Burgundy. Zinfandel is close to a native specialty, brambly and peppery with high alcohol, and the best of it comes from old vines that have been there a century. Sauvignon Blanc is riper and rounder than the Loire or New Zealand versions. Syrah and the other Rhone grapes have quietly become some of the state’s most interesting wines.\n\nOne thing worth knowing if you have not been paying attention for a decade: the state has shifted. The very ripe, very oaked, very high-alcohol style peaked a while ago, and a lot of producers now pick earlier and use less new oak. If your mental image of California wine was formed twenty years ago, it is worth tasting again.',question:'How does California Cabernet usually differ from Bordeaux?',options:['Riper, darker fruit and rounder tannin','Consistently lower alcohol','It is always sweeter'],answer:0},

{title:'Reading the label and buying well',body:'American labeling follows a few rules that are worth knowing, because they tell you how much the words guarantee.\n\nIf a wine names a grape, at least 75 percent of it has to be that grape. If it names an AVA, at least 85 percent of the grapes came from there. If it names a vintage alongside an AVA, at least 95 percent came from that year. And a wine labeled simply California must be made entirely from California grapes, which is a state rule rather than a federal one.\n\nSo the specificity of the appellation tells you something. California, then a county, then an AVA, then a sub-AVA: each step narrows what you are buying. A single vineyard name narrows it further still. None of that guarantees you will like the wine, but it does tell you how much the producer is willing to commit to.\n\nPractical shopping: Napa Cabernet under about thirty dollars is usually blended widely and sold on the name. The same money in Paso Robles, Lodi, the Sierra Foothills or Mendocino buys something far more specific. Alexander Valley and Santa Barbara are reliable middle ground. Old-vine Zinfandel from Dry Creek or Lodi is one of the better value propositions in the state.\n\nNext time you open a California bottle, write down which AVA it came from and where it sits relative to the nearest gap in the hills. Three or four notes in, the map starts assembling itself.',question:'A bottle says Cabernet Sauvignon, Alexander Valley, 2021. What is guaranteed?',options:['It is 100 percent Cabernet from that valley','At least 75 percent Cabernet, 85 percent from Alexander Valley, 95 percent from 2021','Only that it was made in California'],answer:1}]},
{
 "id": "oregon",
 "kind": "course",
 "title": "Oregon, beyond the Pinot habit",
 "summary": "Follow the mountains, valleys and wind. Six lessons connecting Oregon’s places to the wines in your glass.",
 "category": "Regions",
 "tier": 0,
 "status": "published",
 "regions": [
  "Oregon",
  "Willamette Valley",
  "Dundee Hills",
  "Eola-Amity Hills",
  "Van Duzer Corridor",
  "Yamhill-Carlton",
  "Ribbon Ridge",
  "Chehalem Mountains",
  "Laurelwood District",
  "Tualatin Hills",
  "McMinnville",
  "Lower Long Tom",
  "Mount Pisgah, Polk County, Oregon",
  "Southern Oregon",
  "Umpqua Valley",
  "Elkton Oregon",
  "Red Hill Douglas County",
  "Rogue Valley",
  "Applegate Valley",
  "Columbia Gorge",
  "Walla Walla Valley",
  "The Rocks District of Milton-Freewater",
  "Snake River Valley"
 ],
 "grapes": [
  "Pinot Noir",
  "Chardonnay",
  "Pinot Gris",
  "Riesling",
  "Gamay",
  "Tempranillo",
  "Syrah",
  "Viognier",
  "Cabernet Sauvignon"
 ],
 "body": [
  {
   "title": "Start with the mountains",
   "map": "oregon-overview",
   "body": "Oregon is easier to understand once you stop treating it as one cool, rainy place. Start with the Pacific to the west, the Coast Range just inland, and the Cascades farther east. The Willamette Valley sits between those mountain ranges. The Columbia Gorge cuts through the Cascades, while Southern Oregon has its own network of hills and valleys.\n\nIn the Willamette Valley, the Coast Range offers shelter from Pacific storms. Summers bring warmth, evenings cool down, and the growing season gives grapes time to ripen. This combination helps explain the region’s reputation for Pinot Noir. Chardonnay, Pinot Gris and Riesling belong in the picture too.\n\nThe useful question is where the vineyard sits within that landscape. “Oregon” gets you to the state; a regional name helps you ask better questions about the wine. It is a starting point, not a tasting note written in advance.\n\nYour notebook prompt: “My bottle comes from ___. The first thing I want to know about that place is ___.”\n\nFurther reading: https://www.oregonwine.org/regions/willamette-valley/\n\nExplore the regional map: https://www.oregonwine.org/regions/avas/",
   "question": "Why is “Oregon” alone not enough to predict a wine’s style?",
   "options": [
    "Every Oregon vineyard has the same climate",
    "Mountain ranges and local geography create different growing conditions",
    "Only Pinot Noir can be grown there"
   ],
   "answer": 1
  },
  {
   "title": "Willamette, one valley with many voices",
   "map": "oregon-willamette",
   "body": "Think of Willamette Valley as the broad address, with smaller AVAs giving you a closer look. You do not need to memorize every name. Start with a few places and something useful about each.\n\nDundee Hills is associated with red volcanic soils. Eola-Amity Hills is a good place to think about wind: Pacific air passing through the Van Duzer Corridor helps cool the vineyards. The Van Duzer Corridor is also an AVA in its own right. These are different kinds of clues, one about the ground and another about exposure.\n\nMarine sedimentary soils and windblown deposits also appear around the wider valley. None of those soil names is a flavor you must find in your glass. Slope, elevation, the season and the producer’s choices all matter alongside geology.\n\nTry a comparison using notes you already have. Put two Willamette wines side by side on paper. Did one feel fresher, fuller or more drying? Record the producer and vintage before deciding the difference must be the place.\n\nYour notebook prompt: “These wines share a valley, but I noticed ___.”\n\nFurther reading: https://www.oregonwine.org/regions/willamette-valley/dundee-hills-ava/\n\nFurther reading: https://www.oregonwine.org/regions/willamette-valley/eola-amity-hills-ava/\n\nFurther reading: https://www.willamettewines.com/about-the-valley/ava-overviews/",
   "question": "What is a useful way to interpret an Eola-Amity Hills label?",
   "options": [
    "As a guarantee of one exact flavor",
    "As a sign that the wine must be sweet",
    "As a clue to place, including cooling wind exposure"
   ],
   "answer": 2
  },
  {
   "title": "Head south, widen the possibilities",
   "map": "oregon-south",
   "body": "Southern Oregon includes the Umpqua and Rogue valleys and their smaller appellations. It gives you a useful reset if your image of the state begins and ends with Pinot Noir.\n\nThe Umpqua is especially varied. Around Elkton in the north, marine influence supports cool-climate grapes. Farther south around Roseburg, conditions become warmer, with opportunities for grapes such as Tempranillo and Syrah. “Umpqua Valley” is therefore a reason to ask where within the valley the fruit grew.\n\nThe Rogue Valley brings another mix of mountain influences, elevations and exposures. Warm days and cool nights can occur together. Cabernet Sauvignon, Syrah and Viognier are part of its range, along with Pinot Noir and Chardonnay. Applegate Valley sits within the Rogue Valley appellation.\n\nUse the region to widen your options rather than prescribe a favorite. If a guest usually chooses a fuller red, Southern Oregon is somewhere worth exploring; the grape and the particular bottle still decide the conversation.\n\nYour notebook prompt: “An Oregon grape beyond Pinot Noir I would like to explore is ___, because ___.”\n\nFurther reading: https://www.oregonwine.org/regions/umpqua-valley/\n\nFurther reading: https://www.oregonwine.org/regions/rogue-valley/",
   "question": "Which statement best describes Southern Oregon?",
   "options": [
    "A range of sites supporting both cool- and warm-climate grapes",
    "A region where every site is too hot for Pinot Noir",
    "Another name for the Willamette Valley"
   ],
   "answer": 0
  },
  {
   "title": "The Gorge changes as you travel east",
   "map": "oregon-gorge",
   "body": "The Columbia Gorge follows the river along the Oregon–Washington border. The appellation crosses that border, so it is not an Oregon-only region.\n\nHere the lesson is west to east. The western end is cooler, wetter and more influenced by marine air. Farther east, conditions become drier and more continental. The river corridor also channels persistent wind, while elevation changes the conditions at individual vineyards.\n\nThat combination creates room for a wide range of grapes over a relatively short distance. Asking “Which end of the Gorge?” can tell you more than assuming every bottle shares one regional style.\n\nKeep Columbia Gorge and Columbia Valley separate in your notes: they are different appellations. The broader Oregon wine map also includes cross-border regions such as Walla Walla Valley and Snake River Valley. A state line does not stop a growing region.\n\nYour notebook prompt: “The label says ___. I want to check whether that region crosses a state line, and where this vineyard sits.”\n\nFurther reading: https://www.oregonwine.org/regions/columbia-gorge/\n\nExplore the regional map: https://www.oregonwine.org/regions/avas/",
   "question": "What happens as you move east through the Columbia Gorge?",
   "options": [
    "The climate becomes uniformly wetter",
    "Conditions generally become drier and more continental",
    "The influence of vineyard elevation disappears"
   ],
   "answer": 1
  },
  {
   "title": "Look beyond the Pinot habit",
   "map": "oregon-overview",
   "body": "Pinot Noir is an excellent doorway into Oregon, but it does not have to be the whole visit. Willamette Valley also produces Chardonnay, Pinot Gris, Riesling and sparkling wines, among other styles. Farther south, you have already met a different set of possibilities.\n\nThe most useful exercise is to choose one question before you read a description. With a white wine, try: does my mouth water, how much weight does the wine have, and what remains after the sip? With a red, add the drying sensation of tannin. Separate what you feel from what you smell.\n\nThen make a small comparison. If you usually drink Pinot Noir, revisit an old Chardonnay or Pinot Gris note. Which sensations did you describe in both? Which words were simply copied from an expectation about the grape?\n\nThere is no need to open several bottles for this. Your existing journal can become the lesson. Leave anything you did not record blank rather than reconstructing a confident memory.\n\nYour notebook prompt: “I expected ___. What I actually recorded was ___. Next time I will pay attention to ___.”\n\nFurther reading: https://www.oregonwine.org/regions/willamette-valley/",
   "question": "What makes a comparison between two tasting notes useful?",
   "options": [
    "Making both notes fit a regional stereotype",
    "Guessing the details you did not record",
    "Comparing recorded sensations and leaving missing details unknown"
   ],
   "answer": 2
  },
  {
   "title": "Turn the label into a useful question",
   "body": "Before looking at a score, read the producer, grape, vintage and place. Does the bottle name Oregon, Willamette Valley, or a smaller place such as Dundee Hills? Each gives you a different level of geographic detail. Greater specificity is information, not a promise that you will prefer the wine.\n\nUse the region to ask one practical question. For an Eola-Amity Hills wine, you might ask about wind exposure. For a Rogue Valley bottle, ask about the site and grape. For a Columbia Gorge wine, ask where it sits along the west-to-east transition.\n\nWhen choosing a bottle, tell the person helping you what you enjoy and what you want to spend. “I liked the freshness of my last Pinot, but would like to try an Oregon white” is more useful than asking for the best Oregon wine.\n\nSave the bottle to your cellar with the place as printed. After tasting, add a short observation and the occasion you would choose it for again. That closes the loop between the map, the bottle and your own experience.\n\nYour notebook prompt: “This bottle’s place is ___. My question for the next bottle is ___.”\n\nFurther reading: https://www.willamettewines.com/about-the-valley/ava-overviews/",
   "question": "What does a more specific regional name give you?",
   "options": [
    "A closer geographic clue, but no guarantee of personal preference",
    "A guarantee that the wine is better",
    "The exact flavors everyone will taste"
   ],
   "answer": 0
  }
 ]
},
 {id:'pairing-principles',kind:'course',title:'A seat at the table',summary:'Understand how food changes wine, then put the idea to work at dinner.',category:'Food & wine',tier:2,status:'published',body:[
{title:'Taste the food, then the wine',body:'Food can change how a wine tastes. A pairing is an experience, not a rigid rule. Begin with the dominant part of the dish: its sauce, sweetness, salt, acidity, or chilli.\n\nTry a small taste of wine on its own, then after a bite of food. Note what changed.\n\nFurther reading: https://www.wsetglobal.com/knowledge-center/blog/2023/july/13/four-rules-to-masterful-food-and-wine-pairing/'},
{title:'Work with sweetness and heat',body:'Sweet food can make a dry wine seem less fruity and more bitter. With chilli, alcohol can intensify the sensation of heat. These are useful starting points, not promises about everyone’s preferences.\n\nAt your next dinner, compare the wine before and after a small bite. If the combination feels harsh, try water and enjoy the food without forcing a match.\n\nFurther reading: https://www.wsetglobal.com/knowledge-center/blog/2026/how-to-pair-drinks-with-spice'},
{title:'Make your own pairing map',body:'Create three columns in your tasting note: dish, wine, and what changed. Record the sauce and seasoning as well as the main ingredient.\n\nAfter several meals, look for combinations you enjoyed. Your own record will be more useful than a universal pairing chart. Finish by saving a pairing you would serve to friends.'}]},
{id:'cellar-intention',kind:'article',title:'Build a cellar with intention',summary:'Start with the occasions you actually have, and let the collection grow from there.',category:'Cellar craft',tier:1,status:'published',body:[{title:'A collection that fits your life',body:'Before buying another bottle, list three occasions you want your cellar to serve: a weeknight meal, a dinner with friends, or a celebration. Assign the bottles you already own to those occasions.\n\nKeep the useful details together: quantity, storage location, purchase price, and your own planned drinking window. Treat any drinking window as an estimate. Storage history and bottle condition matter.\n\nReview the collection regularly. Move forgotten bottles into view and make a plan for them. A thoughtful cellar is one you enjoy using.'}]},
{id:'better-notes',kind:'article',title:'The three-line tasting note',summary:'A small habit that makes every bottle easier to remember.',category:'Foundations',tier:0,status:'published',body:[{title:'Less ceremony, more memory',body:'Line one: what did you notice? Use a familiar aroma, a texture, or a short phrase.\n\nLine two: where were you, and what was on the table? Context is part of the memory.\n\nLine three: would you choose it again? Say why.\n\nTry it in your tasting journal today. A short note written while the experience is fresh is better than a detailed note you never get around to writing.'}]},
{id:'hosting-flight',kind:'course',title:'The thoughtful host',summary:'Plan an inviting tasting with a clear theme, good notes, and room for conversation.',category:'Hosting',tier:3,status:'published',body:[{title:'Choose one question',body:'A useful tasting starts with a question. How do two styles of the same grape differ? Which bottle works best with tonight’s food? Keep the theme narrow enough that everyone can take part.\n\nTwo or three wines are plenty for a first comparison. Offer water, food, and an equally considered alcohol-free option. Participation should never depend on drinking.'},{title:'Prepare the table',body:'Label glasses or tasting positions so guests can follow the comparison. Keep a short note sheet with space for first impressions and favourites. Offer small pours, and make spitting or leaving wine unfinished feel normal.\n\nThe hosting planner estimates bottle volume from guest count and pour size. It is a supply estimate, not a target for anyone to drink.'},{title:'Let people disagree',body:'Give everyone time to make a first note before discussing the wines. Ask what they noticed, then what they enjoyed. Avoid turning the conversation into a test.\n\nSave the evening’s plan and your favourite pairing in your notebook. Next time, use what you learned to choose a new question.'}]}];
export const plans=[{id:1,name:'Cellar',price:5,tag:'For the everyday enthusiast',features:['Your private cellar and tasting journal','All education articles','Pairing guide and saved hosting plans']},{id:2,name:'Explorer',price:10,tag:'For the endlessly curious',features:['Everything in Cellar','Foundations and food & wine courses','Lesson progress and knowledge checks']},{id:3,name:'Connoisseur',price:15,tag:'For the considered wine life',features:['Everything in Explorer','Every course, including hosting','Access to future top-tier education']}];
