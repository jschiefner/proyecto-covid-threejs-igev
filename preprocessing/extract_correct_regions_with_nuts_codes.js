/*
 * get current file from: https://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units/nuts
 * Download options:
 *
 * Year: NUTS 2021
 * File format: GeoJSON
 * Geometry type: Polygons (RG)
 * Scale: 60M (this is the smallest resolution which yields the best performance but other resolutions work too)
 * Coordinate reference system:	EPSG: 4326 (also used by GPS)
 *
 */

const fs = require('fs');

var file = process.env.DATA_FILE

if (file == null || file == undefined) {
    console.error("no DATA_FILE was specified, please run this program like this: \"DATA_FILE=path/to/file npm run extract-regions\"")
    process.exit(1)
}

file = fs.readFileSync(file)
file = JSON.parse(file)

const available = ['AT11','AT12','AT13','AT21','AT22','AT31','AT32','AT33','AT34','BE1','BE2','BE3','BG311','BG312','BG313','BG314','BG315','BG321','BG322','BG323','BG324','BG325','BG331','BG332','BG333','BG334','BG341','BG342','BG343','BG344','BG412X','BG413','BG414','BG415','BG421','BG422','BG423','BG424','BG425','HR021','HR022','HR023','HR024','HR025','HR026','HR027','HR028','HR031','HR032','HR033','HR034','HR035','HR036','HR037','HR050','HR061','HR062','HR063','HR064','HR065','CY0','CZ010','CZ020','CZ031','CZ032','CZ041','CZ042','CZ051','CZ052','CZ053','CZ063','CZ064','CZ071','CZ072','CZ080','DK01','DK02','DK03','DK04','DK05','GL','EEG11212','EEG11213','EEG11214','EEG11215','EEG11216','EEG11217','EEG11218','EEG11219','EEG11220','EEG11221','EEG11222','EEG11223','EEG11224','EEG11225','EEG11226','FI193','FI194','FI195','FI196','FI197','FI1B','FI1C1','FI1C2','FI1C3','FI1C4','FI1C5','FI1D1','FI1D2','FI1D3','FI1D5','FI1D7','FI1D8','FI1D9','FI2','FR1','FRB','FRC','FRD','FRE','FRF','FRG','FRH','FRI','FRJ','FRK','FRL','FRM','FRY1','FRY2','FRY3','FRY4','FRY5','DE1','DE2','DE3','DE4','DE5','DE6','DE7','DE8','DE9','DEA','DEB','DEC','DED','DEE','DEF','DEG','EL30','EL41','EL42','EL43','EL51','EL52','EL53','EL54','EL61','EL62','EL63','EL64','EL65','HU110','HU120','HU211','HU212','HU213','HU221','HU222','HU223','HU231','HU232','HU233','HU311','HU312','HU313','HU321','HU322','HU323','HU331','HU332','HU333','IS','ISG31','ISG32','ISG33','ISG34','ISG35','ISG36','ISG37','ISG39','IE041','IE042','IE051','IE052','IE053','IE061','IE062','IE063','ITC1','ITC2','ITC3','ITC4','ITF1','ITF2','ITF3','ITF4','ITF5','ITF6','ITG1','ITG2','ITH1','ITH2','ITH3','ITH4','ITH5','ITI1','ITI2','ITI3','ITI4','LV003','LV005','LV006','LV007','LV008','LV009','LI0','LT011','LT021','LT022','LT023','LT024','LT025','LT026','LT027','LT028','LT029','LU0','MT0','NL11','NL12','NL13','NL21','NL22','NL23','NL31','NL32','NL33','NL34','NL41','NL42','NOCSR03','NOCSR11','NOCSR15','NOCSR18','NOCSR30','NOCSR34','NOCSR38','NOCSR42','NOCSR46','NOCSR50','NOCSR54','PL21','PL22','PL41','PL42','PL43','PL51','PL52','PL61','PL62','PL63','PL71','PL72','PL81','PL82','PL84','PL92X','PTCSR01','PTCSR02','PTCSR03','PTCSR04','PTCSR05','PTCSR06','PTCSR07','RO111','RO112','RO113','RO114','RO115','RO116','RO121','RO122','RO123','RO124','RO125','RO126','RO211','RO212','RO213','RO214','RO215','RO216','RO221','RO222','RO223','RO224','RO225','RO226','RO311','RO312','RO313','RO314','RO315','RO316','RO317','RO321','RO322','RO411','RO412','RO413','RO414','RO415','RO421','RO422','RO423','RO424','SK010','SK021','SK022','SK023','SK031','SK032','SK041','SK042','SI031','SI032','SI033','SI034','SI035','SI036','SI037','SI038','SI041','SI042','SI043','SI044','ES11','ES12','ES13','ES21','ES22','ES23','ES24','ES30','ES41','ES42','ES43','ES51','ES52','ES53','ES61','ES62','ES63','ES64','ES70','SE110','SE121','SE122','SE123','SE124','SE125','SE211','SE212','SE213','SE214','SE221','SE224','SE231','SE232','SE311','SE312','SE313','SE321','SE322','SE331','SE332']
console.log("available count: ", available.length)

const root = file
let features = root.features
console.log("features count: ", features.length)
features = features.filter(element => {
    const nuts = element.properties['NUTS_ID']
    return available.includes(nuts);
})
console.log("features count: ", features.length)

root.features = features
const output = JSON.stringify(root)
fs.writeFileSync('extracted.json', output)
