export type Version = [number, number, number];

/**
 * `VersionUtil.ts`
 */
export class VersionUtil {
    static parseVersion(version: string = ''): Version {
        const v: Version = [0, 0, 0];

        version.split('.').forEach((value, i) => (v[i] = parseInt(value, 10)));

        return v;
    }

    static isGreaterOrEqual(version: string, targetVersion: string): boolean {
        const v1 = VersionUtil.parseVersion(version);
        const v2 = VersionUtil.parseVersion(targetVersion);

        return (
            v1[0] > v2[0] ||
            (v1[0] === v2[0] && v1[1] > v2[1]) ||
            (v1[0] === v2[0] && v1[1] === v2[1] && v1[2] >= v2[2])
        );
    }
}
