export class Sandbox {

    public host: string;
    public port: number;
    public password: string;
    public create_time: string;
    public cacert: string;
    public tls: boolean;

    constructor(host: string, port: number, password: string, create_time: string, cacert: string, tls: boolean) {
        this.host = host;
        this.port = port;
        this.password = password;
        this.create_time = create_time;
        this.cacert = cacert;
        this.tls = tls;
    }
}
//# sourceMappingURL=sandbox.js.map
