

///////////////////////// Response Handlers /////////////////////////
const isObject = (value) => (typeof value === 'object');
const isString = (value) => (typeof value === 'string' ||  value instanceof String)

export const gqlJsonResponseHandler = (res: any, queryName: string) => {
    if (res.data[queryName].edges) {
            return res.data[queryName].edges.map((gqlElement: any) =>  gqlElement.node);
    } else {
            return res.data[queryName];
    }
}

export const gqlJsonResponseInstanceHandler = (res: any, queryName: string, entity: string) => {
    return res.data[queryName][entity];
}


export const stringifyJsonFields = (obj: any, columnNames: string[]) => {
    columnNames.forEach( name => {
        if ( obj[name] && !isString(obj[name])) {
            try {
                obj[name] = JSON.stringify(obj[name]) as any
            } catch (error) {
                console.error(`field ${name}: data is not JSON`);
                obj[name] =  JSON.stringify({error: 'JSON STRINGFICATION'}) as any;
            }
        }
    });
}



export const parseStringifiedJsonColumns = (list: any[], columnNames: string[] )  => {
    const _list = [...list];
    _list.forEach(obj => {
        columnNames.forEach(name => {
            if (obj[name] && !isObject(obj[name])) {
                try {
                    obj[name] = JSON.parse(obj[name]);
                } catch (error) {
                    console.log(name, obj[name]);
                    console.error("error column serializer ", error);
                }   
            } 
        });
    });

    return _list;
}
