/**
 * to use this code: import eaGen from this js file as well as the GI module
 * run eaGen with the GI module as input along with other start node input
 * e.g.:
 * const eaGen = require('./eaGen.js').eaGen
 * const module = require('gi-module')
 * const result = await eaGen(module, start_input_1, start_input_2, ...);
 *
 * returns: a json object:
 *   _ result.model -> gi model of the flowchart
 *   _ result.result -> returned output of the flowchart, if the flowchart does not return any value, result.result is the model of the flowchart
 */

// Parameter: {"name":"ROTATE1","value":59,"type":1,"min":"0","max":"180","step":"1"}
// Parameter: {"name":"ROTATE2","value":31,"type":1,"min":"0","max":"180","step":"1"}
// Parameter: {"name":"HEIGHT_RATIO","value":0.42,"type":1,"min":"0","max":"1","step":"0.01"}


async function eaGen(__modules__, ROTATE1, ROTATE2, HEIGHT_RATIO) {

var __debug__ = true;
var __model__ = null;
/** * **/
var PI = __modules__._constants.PI;
var XY = __modules__._constants.XY;
var YZ = __modules__._constants.YZ;
var ZX = __modules__._constants.ZX;
var YX = __modules__._constants.YX;
var ZY = __modules__._constants.ZY;
var XZ = __modules__._constants.XZ;
var isNum = __modules__._types.isNum;
var isInt = __modules__._types.isInt;
var isFlt = __modules__._types.isFlt;
var isBool = __modules__._types.isBool;
var isStr = __modules__._types.isStr;
var isList = __modules__._types.isList;
var isDict = __modules__._types.isDict;
var isVec2 = __modules__._types.isVec2;
var isVec3 = __modules__._types.isVec3;
var isCol = __modules__._types.isCol;
var isRay = __modules__._types.isRay;
var isPln = __modules__._types.isPln;
var isNaN = __modules__._types.isNaN;
var isNull = __modules__._types.isNull;
var isUndef = __modules__._types.isUndef;
var strRepl = __modules__._strs.strRepl;
var strUpp = __modules__._strs.strUpp;
var strLow = __modules__._strs.strLow;
var strTrim = __modules__._strs.strTrim;
var strTrimR = __modules__._strs.strTrimR;
var strTrimL = __modules__._strs.strTrimL;
var strSub = __modules__._strs.strSub;
var strStarts = __modules__._strs.strStarts;
var strEnds = __modules__._strs.strEnds;
var strPadL = __modules__._strs.strPadL;
var strPadR = __modules__._strs.strPadR;
var isApprox = __modules__._util.isApprox;
var isIn = __modules__._util.isIn;
var isWithin = __modules__._util.isWithin;
var min = __modules__._math.min;
var max = __modules__._math.max;
var pow = __modules__._math.pow;
var sqrt = __modules__._math.sqrt;
var exp = __modules__._math.exp;
var log = __modules__._math.log;
var round = __modules__._math.round;
var sigFig = __modules__._math.sigFig;
var ceil = __modules__._math.ceil;
var floor = __modules__._math.floor;
var abs = __modules__._math.abs;
var sin = __modules__._math.sin;
var asin = __modules__._math.asin;
var sinh = __modules__._math.sinh;
var asinh = __modules__._math.asinh;
var cos = __modules__._math.cos;
var acos = __modules__._math.acos;
var cosh = __modules__._math.cosh;
var acosh = __modules__._math.acosh;
var tan = __modules__._math.tan;
var atan = __modules__._math.atan;
var tanh = __modules__._math.tanh;
var atanh = __modules__._math.atanh;
var atan2 = __modules__._math.atan2;
var boolean = __modules__._mathjs.boolean;
var number = __modules__._mathjs.number;
var string = __modules__._mathjs.string;
var mad = __modules__._mathjs.mad;
var mean = __modules__._mathjs.mean;
var median = __modules__._mathjs.median;
var mode = __modules__._mathjs.mode;
var prod = __modules__._mathjs.prod;
var std = __modules__._mathjs.std;
var vari = __modules__._mathjs.vari;
var sum = __modules__._mathjs.sum;
var hypot = __modules__._mathjs.hypot;
var norm = __modules__._mathjs.norm;
var square = __modules__._mathjs.square;
var cube = __modules__._mathjs.cube;
var remap = __modules__._arithmetic.remap;
var distance = __modules__._geometry.distance;
var distanceM = __modules__._geometry.distanceM;
var distanceMS = __modules__._geometry.distanceMS;
var intersect = __modules__._geometry.intersect;
var project = __modules__._geometry.project;
var range = __modules__._list.range;
var len = __modules__._common.len;
var listCount = __modules__._list.listCount;
var listCopy = __modules__._list.listCopy;
var listRep = __modules__._list.listRep;
var listLast = __modules__._list.listLast;
var listGet = __modules__._list.listGet;
var listFind = __modules__._list.listFind;
var listHas = __modules__._list.listHas;
var listJoin = __modules__._list.listJoin;
var listFlat = __modules__._list.listFlat;
var listRot = __modules__._list.listRot;
var listSlice = __modules__._list.listSlice;
var listRev = __modules__._list.listRev;
var listCull = __modules__._list.listCull;
var listSort = __modules__._list.listSort;
var listZip = __modules__._list.listZip;
var listEq = __modules__._list.listEq;
var dictGet = __modules__._dict.dictGet;
var dictKeys = __modules__._dict.dictKeys;
var dictVals = __modules__._dict.dictVals;
var dictHasKey = __modules__._dict.dictHasKey;
var dictHasVal = __modules__._dict.dictHasVal;
var dictFind = __modules__._dict.dictFind;
var dictCopy = __modules__._dict.dictCopy;
var dictEq = __modules__._dict.dictEq;
var setMake = __modules__._set.setMake;
var setUni = __modules__._set.setUni;
var setInt = __modules__._set.setInt;
var setDif = __modules__._set.setDif;
var vecAdd = __modules__._vec.vecAdd;
var vecSub = __modules__._vec.vecSub;
var vecDiv = __modules__._vec.vecDiv;
var vecMult = __modules__._vec.vecMult;
var vecSum = __modules__._vec.vecSum;
var vecLen = __modules__._vec.vecLen;
var vecSetLen = __modules__._vec.vecSetLen;
var vecNorm = __modules__._vec.vecNorm;
var vecRev = __modules__._vec.vecRev;
var vecFromTo = __modules__._vec.vecFromTo;
var vecAng = __modules__._vec.vecAng;
var vecAng2 = __modules__._vec.vecAng2;
var vecDot = __modules__._vec.vecDot;
var vecCross = __modules__._vec.vecCross;
var vecEqual = __modules__._vec.vecEqual;
var vecLtoG = __modules__._vec.vecLtoG;
var vecGtoL = __modules__._vec.vecGtoL;
var plnMake = __modules__._plane.plnMake;
var plnCopy = __modules__._plane.plnCopy;
var plnMove = __modules__._plane.plnMove;
var plnRot = __modules__._plane.plnRot;
var plnLMove = __modules__._plane.plnLMove;
var plnLRotX = __modules__._plane.plnLRotX;
var plnLRotY = __modules__._plane.plnLRotY;
var plnLRotZ = __modules__._plane.plnLRotZ;
var rayMake = __modules__._ray.rayMake;
var rayCopy = __modules__._ray.rayCopy;
var rayMove = __modules__._ray.rayMove;
var rayRot = __modules__._ray.rayRot;
var rayLMove = __modules__._ray.rayLMove;
var rayFromPln = __modules__._ray.rayFromPln;
var rayLtoG = __modules__._ray.rayLtoG;
var rayGtoL = __modules__._ray.rayGtoL;
var colFalse = __modules__._colors.colFalse;
var colScale = __modules__._colors.colScale;
var radToDeg = __modules__._conversion.radToDeg;
var degToRad = __modules__._conversion.degToRad;
var numToStr = __modules__._conversion.numToStr;
var rand = __modules__._rand.rand;
var randInt = __modules__._rand.randInt;
var randPick = __modules__._rand.randPick;

async function exec_eaGen(__params__, ROTATE1_, ROTATE2_, HEIGHT_RATIO_){

async function exec_eaGen_node_5ghc6lyoup(__params__, ROTATE1_, ROTATE2_, HEIGHT_RATIO_){
__modules__._model.__preprocess__( __params__.model);

let pln1_ = plnLRotZ(__debug__, plnMake(__debug__, [0, -16, 0], [1, 0, 0], [0, 1, 0]), degToRad(__debug__, ROTATE1_));

let pln2_ = plnLRotZ(__debug__, plnMake(__debug__, [0, 16, 0], [1, 0, 0], [0, 1, 0]), degToRad(__debug__, ROTATE2_));

let rec1_ = __modules__.pattern.Rectangle( __params__.model, pln1_, [28, 19] );

let rec2_ = __modules__.pattern.Rectangle( __params__.model, pln2_, [28, 19] );

let base1_ = __modules__.make.Polygon( __params__.model, rec1_ );

let base2_ = __modules__.make.Polygon( __params__.model, rec2_ );

__modules__.attrib.Set(__params__.model, base1_, 'num_floors',  round(__debug__, 28 * HEIGHT_RATIO_) );

__modules__.attrib.Set(__params__.model, base2_, 'num_floors',  28 -  __modules__.attrib.Get(__params__.model, base1_, 'num_floors') );
__modules__._model.__postprocess__( __params__.model);
}


async function exec_eaGen_node_v9ahetwj1n9(__params__, ROTATE1_, ROTATE2_, HEIGHT_RATIO_){
__modules__._model.__preprocess__( __params__.model);

for (let  base_ of __modules__.query.Get(__params__.model, 'pg', null)){

let num_floors_ = __modules__.attrib.Get(__params__.model, base_, 'num_floors');

let edges_ = __modules__.query.Get(__params__.model, '_e', base_);

for (let  edge_ of [edges_[pythonList(0, edges_.length)], edges_[pythonList(2, edges_.length)]]){

let pline_ = __modules__.make.Polyline( __params__.model, edge_, 'open' );

let div_ = __modules__.edit.Divide( __params__.model, pline_, 5, 'by_max_length' );

let facade_ = __modules__.make.Extrude( __params__.model, pline_, num_floors_ * 3, num_floors_, 'quads' );

__modules__.attrib.Set(__params__.model, facade_, 'type',  "facade" );
}

let wall_ = __modules__.make.Extrude( __params__.model, [edges_[pythonList(1, edges_.length)], edges_[pythonList(3, edges_.length)]], num_floors_ * 3, 1, 'quads' );

__modules__.attrib.Set(__params__.model, wall_, 'type',  "wall" );

let roof_ = __modules__.make.Copy( __params__.model, base_, [0, 0, num_floors_ * 3] );

let roof_ex_ = __modules__.make.Extrude( __params__.model, roof_, 2, 1, 'quads' );
}

let site_rec_ = __modules__.pattern.Rectangle( __params__.model, JSON.parse(JSON.stringify(XY)), [30, 70] );

let site_pgon_ = __modules__.make.Polygon( __params__.model, site_rec_ );

let coll_ = __modules__.collection.Create( __params__.model, __modules__.query.Get(__params__.model, 'pg', null), "buildings" );
__modules__._model.__postprocess__( __params__.model);
}


async function exec_eaGen_node_6kn62qhfwjo(__params__, ROTATE1_, ROTATE2_, HEIGHT_RATIO_){
__modules__._model.__preprocess__( __params__.model);

let coll_buildings_ = __modules__.collection.Get( __params__.model, "buildings" );

let facade_pgons_ = __modules__.query.Filter(__params__.model,  __modules__.query.Get(__params__.model, 'pg', coll_buildings_), ['type', null], '==', "facade");

for (let  pgon_ of facade_pgons_){

let nor_ = __modules__.calc.Normal( __params__.model, pgon_, 1 );

let cen_ = __modules__.calc.Centroid( __params__.model, pgon_, 'ps_average' );

let ray_ = rayMake(__debug__, cen_, nor_);

let vis_ = __modules__.visualize.Ray( __params__.model, ray_, 0.1 );

__modules__.attrib.Set(__params__.model, pgon_, 'ray',  ray_ );
}
__modules__._model.__postprocess__( __params__.model);
}


async function exec_eaGen_node_va62l7fv8pn(__params__, ROTATE1_, ROTATE2_, HEIGHT_RATIO_){
__modules__._model.__preprocess__( __params__.model);

for (let  base_ of __modules__.query.Get(__params__.model, 'pg', null)){

let ex_ = __modules__.make.Extrude( __params__.model, base_, 2 + ( __modules__.attrib.Get(__params__.model, base_, 'num_floors')* 3), 1, 'quads' );
}

let coll_ = __modules__.collection.Create( __params__.model, __modules__.query.Get(__params__.model, 'pg', null), "buildings_obstructions" );
__modules__._model.__postprocess__( __params__.model);
}


async function exec_eaGen_node_4yzy0g4lboc(__params__, ROTATE1_, ROTATE2_, HEIGHT_RATIO_){
__modules__._model.__preprocess__( __params__.model);

await __modules__.io.Export( __params__.model, null, "ea_model1.gi", 'gi', 'Save to Local Storage' );

return null;
}

var merged;
let ssid_exec_eaGen_node_atyjicu3vpr = __params__.model.getActiveSnapshot();

let ssid_exec_eaGen_node_5ghc6lyoup = ssid_exec_eaGen_node_atyjicu3vpr;

await exec_eaGen_node_5ghc6lyoup(__params__, ROTATE1_, ROTATE2_, HEIGHT_RATIO_);

let ssid_exec_eaGen_node_v9ahetwj1n9 = __params__.model.nextSnapshot([ssid_exec_eaGen_node_5ghc6lyoup]);

await exec_eaGen_node_v9ahetwj1n9(__params__, ROTATE1_, ROTATE2_, HEIGHT_RATIO_);

let ssid_exec_eaGen_node_6kn62qhfwjo = ssid_exec_eaGen_node_v9ahetwj1n9;

await exec_eaGen_node_6kn62qhfwjo(__params__, ROTATE1_, ROTATE2_, HEIGHT_RATIO_);

let ssid_exec_eaGen_node_va62l7fv8pn = __params__.model.nextSnapshot([ssid_exec_eaGen_node_5ghc6lyoup]);

await exec_eaGen_node_va62l7fv8pn(__params__, ROTATE1_, ROTATE2_, HEIGHT_RATIO_);

let ssid_exec_eaGen_node_4yzy0g4lboc = __params__.model.nextSnapshot([ssid_exec_eaGen_node_6kn62qhfwjo, ssid_exec_eaGen_node_va62l7fv8pn]);

return await exec_eaGen_node_4yzy0g4lboc(__params__, ROTATE1_, ROTATE2_, HEIGHT_RATIO_);
}


function pythonList(x, l){
    if (x < 0) {
        return x + l;
    }
    return x;
}

function mergeInputs(models){
    let result = null;
    if (models.length === 0) {
        result = __modules__._model.__new__();
    } else if (models.length === 1) {
        result = models[0].clone();
    } else {
        result = models[0].clone();
        for (let i = 1; i < models.length; i++) {
            __modules__._model.__merge__(result, models[i]);
        }
    }
    try {
        result.debug = __debug__;
    } catch (ex) {}
    return result;
}
function duplicateModel(model){
    const result = model.clone();
    try {
        result.debug = __debug__;
    } catch (ex) {}
    return result;
}

function printFunc(_console, name, value){
    let val;
    let padding_style = 'padding: 2px 0px 2px 10px;';
    if (!value) {
        val = value;
    } else if (value === '__null__') {
        _console.push('<p style="' + padding_style + '"><b><i>_ ' + name + '</i></b></p>');
        return value;
    } else if (typeof value === 'number' || value === undefined) {
        val = value;
    } else if (typeof value === 'string') {
        val = '"' + value.replace(/\n/g, '<br>') + '"';
    } else if (value.constructor === [].constructor) {
        let __list_check__ = false;
        let __value_strings__ = [];
        for (const __item__ of value) {
            if (!__item__) {
                __value_strings__.push('' + __item__);
                continue;
            }
            if (__item__.constructor === [].constructor || __item__.constructor === {}.constructor) {
                __list_check__ = true;
            }
            __value_strings__.push(JSON.stringify(__item__).replace(/,/g, ', '));
        }
        if (__list_check__) {
            padding_style = 'padding: 2px 0px 0px 10px;';
            val = '[<p style="padding: 0px 0px 2px 40px;">' +
                  __value_strings__.join(',</p><p style="padding: 0px 0px 2px 40px;">') +
                  '</p><p style="padding: 0px 0px 2px 30px;">]</p>';
        } else {
            val = '[' + __value_strings__.join(', ') + ']';
        }
    } else if (value.constructor === {}.constructor) {
        let __list_check__ = false;
        let __value_strings__ = [];
        for (const __item__ in value) {
            const __value__ = value[__item__];
            if (!__value__) {
                __value_strings__.push('\<b>"' + __item__ + '\"</b>' + ': ' + __value__);
                continue;
            }
            if (__value__.constructor === [].constructor || __value__.constructor === {}.constructor) {
                __list_check__ = true;
            }
            __value_strings__.push('\<b>"' + __item__ + '\"</b>' + ': ' + JSON.stringify(__value__).replace(/,/g, ', '));
        }
        if (__list_check__) {
            padding_style = 'padding: 2px 0px 0px 10px;';
            val = '{<p style="padding: 0px 0px 2px 40px;">' +
                  __value_strings__.join(',</p><p style="padding: 0px 0px 2px 40px;">') +
                  '</p><p style="padding: 0px 0px 2px 30px;">}</p>';
        } else {
            val = '{' + __value_strings__.join(', ') + '}';
        }
    } else {
        val = value;
    }
    _console.push('<p style="' + padding_style + '"><b><i>_ ' + name+'</i></b>  = ' + val + '</p>');
    return val;
}


const __params__ = {};
__params__["model"] = __modules__._model.__new__();
if (__model__) {
__modules__.io._importGI(__params__["model"], __model__);
}
__params__["model"].debug = __debug__;
__params__["console"] = [];
__params__["modules"] = __modules__;
__params__["curr_ss"] = {};
const result = await exec_eaGen(__params__, ROTATE1, ROTATE2, HEIGHT_RATIO);
if (result === __params__.model) { return { "model": __params__.model, "result": null };}
return {"model": __params__.model, "result": result};
/** * **/

}

module.exports = eaGen;
