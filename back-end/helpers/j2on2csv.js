const { Parser, transforms: { unwind } } = require('json2csv');

module.exports=function json2csv (json){
    var fields=Object.keys(json);
    if(Array.isArray(json[fields[fields.length-1]])){
        var arr_name=fields.pop()

        const transforms=[unwind({paths:arr_name})];
        fields=fields.concat(Object.keys(json[arr_name][0]).map(name=>{
            return{
            label:name,
            value:arr_name+"."+name
            }
        }));
        const json2csvparser=new Parser({fields,transforms});
        return json2csvparser.parse(json);
    }
    else{
        const json2csvparser=new Parser();
        return json2csvparser.parse(json);
    }
};