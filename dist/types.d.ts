import { z } from 'zod';
export declare const ConfigResponseSchema: z.ZodObject<{
    apiVersion: z.ZodString;
    appVersion: z.ZodOptional<z.ZodString>;
    languages: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
    }, {
        id: string;
        label: string;
    }>, "many">;
    defaultLanguage: z.ZodString;
    maxDataCells: z.ZodNumber;
    maxCallsPerTimeWindow: z.ZodNumber;
    timeWindow: z.ZodNumber;
    license: z.ZodString;
    sourceReferences: z.ZodOptional<z.ZodArray<z.ZodObject<{
        language: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        language: string;
        text: string;
    }, {
        language: string;
        text: string;
    }>, "many">>;
    features: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        params: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            key: string;
        }, {
            value: string;
            key: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        params?: {
            value: string;
            key: string;
        }[] | undefined;
    }, {
        id: string;
        params?: {
            value: string;
            key: string;
        }[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    apiVersion: string;
    languages: {
        id: string;
        label: string;
    }[];
    defaultLanguage: string;
    maxDataCells: number;
    maxCallsPerTimeWindow: number;
    timeWindow: number;
    license: string;
    appVersion?: string | undefined;
    sourceReferences?: {
        language: string;
        text: string;
    }[] | undefined;
    features?: {
        id: string;
        params?: {
            value: string;
            key: string;
        }[] | undefined;
    }[] | undefined;
}, {
    apiVersion: string;
    languages: {
        id: string;
        label: string;
    }[];
    defaultLanguage: string;
    maxDataCells: number;
    maxCallsPerTimeWindow: number;
    timeWindow: number;
    license: string;
    appVersion?: string | undefined;
    sourceReferences?: {
        language: string;
        text: string;
    }[] | undefined;
    features?: {
        id: string;
        params?: {
            value: string;
            key: string;
        }[] | undefined;
    }[] | undefined;
}>;
export declare const FolderResponseSchema: z.ZodObject<{
    language: z.ZodString;
    id: z.ZodNullable<z.ZodString>;
    label: z.ZodNullable<z.ZodString>;
    description: z.ZodNullable<z.ZodString>;
    folderContents: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["FolderInformation", "Table", "Heading"]>;
        id: z.ZodString;
        label: z.ZodString;
        description: z.ZodString;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        updated: z.ZodOptional<z.ZodString>;
        firstPeriod: z.ZodOptional<z.ZodString>;
        lastPeriod: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodEnum<["internal", "public", "private", "section"]>>;
        variableNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        discontinued: z.ZodOptional<z.ZodBoolean>;
        links: z.ZodArray<z.ZodObject<{
            rel: z.ZodString;
            hreflang: z.ZodString;
            href: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            rel: string;
            hreflang: string;
            href: string;
        }, {
            rel: string;
            hreflang: string;
            href: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "FolderInformation" | "Table" | "Heading";
        id: string;
        label: string;
        description: string;
        links: {
            rel: string;
            hreflang: string;
            href: string;
        }[];
        tags?: string[] | undefined;
        updated?: string | undefined;
        firstPeriod?: string | undefined;
        lastPeriod?: string | undefined;
        category?: "internal" | "public" | "private" | "section" | undefined;
        variableNames?: string[] | undefined;
        discontinued?: boolean | undefined;
    }, {
        type: "FolderInformation" | "Table" | "Heading";
        id: string;
        label: string;
        description: string;
        links: {
            rel: string;
            hreflang: string;
            href: string;
        }[];
        tags?: string[] | undefined;
        updated?: string | undefined;
        firstPeriod?: string | undefined;
        lastPeriod?: string | undefined;
        category?: "internal" | "public" | "private" | "section" | undefined;
        variableNames?: string[] | undefined;
        discontinued?: boolean | undefined;
    }>, "many">;
    links: z.ZodArray<z.ZodObject<{
        rel: z.ZodString;
        hreflang: z.ZodString;
        href: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        rel: string;
        hreflang: string;
        href: string;
    }, {
        rel: string;
        hreflang: string;
        href: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string | null;
    label: string | null;
    language: string;
    description: string | null;
    folderContents: {
        type: "FolderInformation" | "Table" | "Heading";
        id: string;
        label: string;
        description: string;
        links: {
            rel: string;
            hreflang: string;
            href: string;
        }[];
        tags?: string[] | undefined;
        updated?: string | undefined;
        firstPeriod?: string | undefined;
        lastPeriod?: string | undefined;
        category?: "internal" | "public" | "private" | "section" | undefined;
        variableNames?: string[] | undefined;
        discontinued?: boolean | undefined;
    }[];
    links: {
        rel: string;
        hreflang: string;
        href: string;
    }[];
}, {
    id: string | null;
    label: string | null;
    language: string;
    description: string | null;
    folderContents: {
        type: "FolderInformation" | "Table" | "Heading";
        id: string;
        label: string;
        description: string;
        links: {
            rel: string;
            hreflang: string;
            href: string;
        }[];
        tags?: string[] | undefined;
        updated?: string | undefined;
        firstPeriod?: string | undefined;
        lastPeriod?: string | undefined;
        category?: "internal" | "public" | "private" | "section" | undefined;
        variableNames?: string[] | undefined;
        discontinued?: boolean | undefined;
    }[];
    links: {
        rel: string;
        hreflang: string;
        href: string;
    }[];
}>;
export declare const TablesResponseSchema: z.ZodObject<{
    language: z.ZodString;
    tables: z.ZodArray<z.ZodObject<{
        type: z.ZodOptional<z.ZodLiteral<"Table">>;
        id: z.ZodString;
        label: z.ZodString;
        description: z.ZodString;
        updated: z.ZodOptional<z.ZodString>;
        firstPeriod: z.ZodOptional<z.ZodString>;
        lastPeriod: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodEnum<["internal", "public", "private", "section"]>>;
        variableNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        source: z.ZodOptional<z.ZodString>;
        subjectCode: z.ZodOptional<z.ZodString>;
        timeUnit: z.ZodOptional<z.ZodString>;
        discontinued: z.ZodOptional<z.ZodBoolean>;
        paths: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            label: string;
        }, {
            id: string;
            label: string;
        }>, "many">, "many">>;
        links: z.ZodArray<z.ZodObject<{
            rel: z.ZodString;
            hreflang: z.ZodString;
            href: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            rel: string;
            hreflang: string;
            href: string;
        }, {
            rel: string;
            hreflang: string;
            href: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        description: string;
        links: {
            rel: string;
            hreflang: string;
            href: string;
        }[];
        type?: "Table" | undefined;
        updated?: string | undefined;
        firstPeriod?: string | undefined;
        lastPeriod?: string | undefined;
        category?: "internal" | "public" | "private" | "section" | undefined;
        variableNames?: string[] | undefined;
        discontinued?: boolean | undefined;
        source?: string | undefined;
        subjectCode?: string | undefined;
        timeUnit?: string | undefined;
        paths?: {
            id: string;
            label: string;
        }[][] | undefined;
    }, {
        id: string;
        label: string;
        description: string;
        links: {
            rel: string;
            hreflang: string;
            href: string;
        }[];
        type?: "Table" | undefined;
        updated?: string | undefined;
        firstPeriod?: string | undefined;
        lastPeriod?: string | undefined;
        category?: "internal" | "public" | "private" | "section" | undefined;
        variableNames?: string[] | undefined;
        discontinued?: boolean | undefined;
        source?: string | undefined;
        subjectCode?: string | undefined;
        timeUnit?: string | undefined;
        paths?: {
            id: string;
            label: string;
        }[][] | undefined;
    }>, "many">;
    page: z.ZodObject<{
        pageNumber: z.ZodNumber;
        pageSize: z.ZodNumber;
        totalElements: z.ZodNumber;
        totalPages: z.ZodNumber;
        links: z.ZodOptional<z.ZodArray<z.ZodObject<{
            rel: z.ZodString;
            hreflang: z.ZodString;
            href: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            rel: string;
            hreflang: string;
            href: string;
        }, {
            rel: string;
            hreflang: string;
            href: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        links?: {
            rel: string;
            hreflang: string;
            href: string;
        }[] | undefined;
    }, {
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        links?: {
            rel: string;
            hreflang: string;
            href: string;
        }[] | undefined;
    }>;
    links: z.ZodArray<z.ZodObject<{
        rel: z.ZodString;
        hreflang: z.ZodString;
        href: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        rel: string;
        hreflang: string;
        href: string;
    }, {
        rel: string;
        hreflang: string;
        href: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    language: string;
    links: {
        rel: string;
        hreflang: string;
        href: string;
    }[];
    tables: {
        id: string;
        label: string;
        description: string;
        links: {
            rel: string;
            hreflang: string;
            href: string;
        }[];
        type?: "Table" | undefined;
        updated?: string | undefined;
        firstPeriod?: string | undefined;
        lastPeriod?: string | undefined;
        category?: "internal" | "public" | "private" | "section" | undefined;
        variableNames?: string[] | undefined;
        discontinued?: boolean | undefined;
        source?: string | undefined;
        subjectCode?: string | undefined;
        timeUnit?: string | undefined;
        paths?: {
            id: string;
            label: string;
        }[][] | undefined;
    }[];
    page: {
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        links?: {
            rel: string;
            hreflang: string;
            href: string;
        }[] | undefined;
    };
}, {
    language: string;
    links: {
        rel: string;
        hreflang: string;
        href: string;
    }[];
    tables: {
        id: string;
        label: string;
        description: string;
        links: {
            rel: string;
            hreflang: string;
            href: string;
        }[];
        type?: "Table" | undefined;
        updated?: string | undefined;
        firstPeriod?: string | undefined;
        lastPeriod?: string | undefined;
        category?: "internal" | "public" | "private" | "section" | undefined;
        variableNames?: string[] | undefined;
        discontinued?: boolean | undefined;
        source?: string | undefined;
        subjectCode?: string | undefined;
        timeUnit?: string | undefined;
        paths?: {
            id: string;
            label: string;
        }[][] | undefined;
    }[];
    page: {
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        links?: {
            rel: string;
            hreflang: string;
            href: string;
        }[] | undefined;
    };
}>;
export declare const DatasetSchema: z.ZodObject<{
    version: z.ZodLiteral<"2.0">;
    class: z.ZodLiteral<"dataset">;
    id: z.ZodArray<z.ZodString, "many">;
    label: z.ZodString;
    source: z.ZodOptional<z.ZodString>;
    updated: z.ZodOptional<z.ZodString>;
    size: z.ZodArray<z.ZodNumber, "many">;
    dimension: z.ZodRecord<z.ZodString, z.ZodObject<{
        label: z.ZodString;
        category: z.ZodObject<{
            index: z.ZodRecord<z.ZodString, z.ZodNumber>;
            label: z.ZodRecord<z.ZodString, z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            label: Record<string, string>;
            index: Record<string, number>;
        }, {
            label: Record<string, string>;
            index: Record<string, number>;
        }>;
        extension: z.ZodOptional<z.ZodObject<{
            elimination: z.ZodOptional<z.ZodBoolean>;
            eliminationValueCode: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            elimination?: boolean | undefined;
            eliminationValueCode?: string | undefined;
        }, {
            elimination?: boolean | undefined;
            eliminationValueCode?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        category: {
            label: Record<string, string>;
            index: Record<string, number>;
        };
        extension?: {
            elimination?: boolean | undefined;
            eliminationValueCode?: string | undefined;
        } | undefined;
    }, {
        label: string;
        category: {
            label: Record<string, string>;
            index: Record<string, number>;
        };
        extension?: {
            elimination?: boolean | undefined;
            eliminationValueCode?: string | undefined;
        } | undefined;
    }>>;
    value: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodNullable<z.ZodNumber>, "many">>>;
    extension: z.ZodOptional<z.ZodObject<{
        px: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        contact: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            mail: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            mail?: string | undefined;
            phone?: string | undefined;
        }, {
            name?: string | undefined;
            mail?: string | undefined;
            phone?: string | undefined;
        }>, "many">>;
        notes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            mandatory: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            text: string;
            mandatory: boolean;
        }, {
            text: string;
            mandatory: boolean;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        px?: Record<string, any> | undefined;
        contact?: {
            name?: string | undefined;
            mail?: string | undefined;
            phone?: string | undefined;
        }[] | undefined;
        notes?: {
            text: string;
            mandatory: boolean;
        }[] | undefined;
    }, {
        px?: Record<string, any> | undefined;
        contact?: {
            name?: string | undefined;
            mail?: string | undefined;
            phone?: string | undefined;
        }[] | undefined;
        notes?: {
            text: string;
            mandatory: boolean;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string[];
    label: string;
    version: "2.0";
    class: "dataset";
    size: number[];
    dimension: Record<string, {
        label: string;
        category: {
            label: Record<string, string>;
            index: Record<string, number>;
        };
        extension?: {
            elimination?: boolean | undefined;
            eliminationValueCode?: string | undefined;
        } | undefined;
    }>;
    value?: (number | null)[] | null | undefined;
    updated?: string | undefined;
    source?: string | undefined;
    extension?: {
        px?: Record<string, any> | undefined;
        contact?: {
            name?: string | undefined;
            mail?: string | undefined;
            phone?: string | undefined;
        }[] | undefined;
        notes?: {
            text: string;
            mandatory: boolean;
        }[] | undefined;
    } | undefined;
}, {
    id: string[];
    label: string;
    version: "2.0";
    class: "dataset";
    size: number[];
    dimension: Record<string, {
        label: string;
        category: {
            label: Record<string, string>;
            index: Record<string, number>;
        };
        extension?: {
            elimination?: boolean | undefined;
            eliminationValueCode?: string | undefined;
        } | undefined;
    }>;
    value?: (number | null)[] | null | undefined;
    updated?: string | undefined;
    source?: string | undefined;
    extension?: {
        px?: Record<string, any> | undefined;
        contact?: {
            name?: string | undefined;
            mail?: string | undefined;
            phone?: string | undefined;
        }[] | undefined;
        notes?: {
            text: string;
            mandatory: boolean;
        }[] | undefined;
    } | undefined;
}>;
export type ConfigResponse = z.infer<typeof ConfigResponseSchema>;
export type FolderResponse = z.infer<typeof FolderResponseSchema>;
export type TablesResponse = z.infer<typeof TablesResponseSchema>;
export type Dataset = z.infer<typeof DatasetSchema>;
export interface RateLimitInfo {
    remaining: number;
    resetTime: Date;
    maxCalls: number;
    timeWindow: number;
}
//# sourceMappingURL=types.d.ts.map