declare module 'helyos-service' {

 export interface GQLApiService {}

}


interface GlobalFetch {
    fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

declare module 'node-fetch' {
    const fetch: GlobalFetch['fetch'];
    export default fetch;
}

