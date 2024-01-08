/* eslint-disable @typescript-eslint/no-explicit-any */

interface BuildOption {
    useRid: boolean;
}

interface ParsedUrl {
    [key: string]: any;
}

/**
 * `ConnectorBuilder.ts`
 *
 * Connector class의 기타 유용한 Builder Util을 정의한 class
 */
export class ConnectorBuilder {
    readonly '_instance' = Symbol.for('ConnectorBuilder');

    /**
     * 주어진 options에 따라서, 필요한 정보들을 골라내어
     * 새로운 options를 만든 후 반환
     */
    static createConnectorOption(options: any, buildOption?: BuildOption): any {
        if (options.url) {
            const parsedUrl: ParsedUrl = this.toConnectUrl(options.url);

            if (buildOption && buildOption.useRid && parsedUrl.database) {
                parsedUrl.rid = parsedUrl.database;
            }

            for (const key of Object.keys(parsedUrl)) {
                if (!parsedUrl[key]) {
                    delete parsedUrl[key];
                }
            }

            return Object.assign({}, options, parsedUrl);
        }

        return Object.assign({}, options);
    }

    /**
     * URL 정보에서 유용한 정보들을 빼낸 후
     * Object로 반환하도록 한다.
     */
    private static toConnectUrl(url: string): ParsedUrl {
        const type = url.split(':')[0];
        const firstSlashes = url.indexOf('//');
        const preBase = url.substring(firstSlashes + 2);
        const secondSlash = preBase.indexOf('/');
        const base = secondSlash !== -1 ? preBase.substring(0, secondSlash) : preBase;

        let afterBase = secondSlash !== -1 ? preBase.substring(secondSlash + 1) : null;

        if (afterBase && afterBase.indexOf('?') !== -1) {
            afterBase = afterBase.substring(0, afterBase.indexOf('?'));
        }

        const lastAtSign = base.lastIndexOf('@');
        const usernameAndPassword = base.substring(0, lastAtSign);
        const hostAndPort = base.substring(lastAtSign + 1);

        let username = usernameAndPassword;
        let password = '';

        const firstColon = usernameAndPassword.indexOf(':');

        if (firstColon !== -1) {
            username = usernameAndPassword.substring(0, firstColon);
            password = usernameAndPassword.substring(firstColon + 1);
        }

        const [host, port] = hostAndPort.split(':');

        return {
            type: type,
            host: host,
            username: decodeURIComponent(username),
            password: decodeURIComponent(password),
            port: port ? parseInt(port) : null,
            database: afterBase || null,
        };
    }
}
