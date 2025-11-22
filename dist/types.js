import { z } from 'zod';
// Base SCB API types based on OpenAPI spec
export const ConfigResponseSchema = z.object({
    apiVersion: z.string(),
    appVersion: z.string().optional(),
    languages: z.array(z.object({
        id: z.string(),
        label: z.string()
    })),
    defaultLanguage: z.string(),
    maxDataCells: z.number(),
    maxCallsPerTimeWindow: z.number(),
    timeWindow: z.number(),
    license: z.string(),
    sourceReferences: z.array(z.object({
        language: z.string(),
        text: z.string()
    })).optional(),
    features: z.array(z.object({
        id: z.string(),
        params: z.array(z.object({
            key: z.string(),
            value: z.string()
        })).optional()
    })).optional()
});
// NOTE: FolderResponseSchema is for the /navigation endpoint which has been REMOVED in SCB API v2
// This schema is kept for backwards compatibility but the endpoint is no longer functional
// See: https://www.scb.se/en/services/open-data-api/pxwebapi/pxapi-2.0
export const FolderResponseSchema = z.object({
    language: z.string(),
    id: z.string().nullable(),
    label: z.string().nullable(),
    description: z.string().nullable(),
    folderContents: z.array(z.object({
        type: z.enum(['FolderInformation', 'Table', 'Heading']),
        id: z.string(),
        label: z.string(),
        description: z.string(),
        tags: z.array(z.string()).optional(),
        updated: z.string().optional(),
        firstPeriod: z.string().optional(),
        lastPeriod: z.string().optional(),
        category: z.enum(['internal', 'public', 'private', 'section']).optional(),
        variableNames: z.array(z.string()).optional(),
        discontinued: z.boolean().optional(),
        links: z.array(z.object({
            rel: z.string(),
            hreflang: z.string(),
            href: z.string()
        }))
    })),
    links: z.array(z.object({
        rel: z.string(),
        hreflang: z.string(),
        href: z.string()
    }))
});
export const TablesResponseSchema = z.object({
    language: z.string(),
    tables: z.array(z.object({
        // NOTE: 'type' field was removed in SCB API v2 - it's no longer returned by the API
        // Previous API versions had type: 'Table' but v2 does not include this field
        type: z.literal('Table').optional(),
        id: z.string(),
        label: z.string(),
        description: z.string(),
        updated: z.string().optional(),
        firstPeriod: z.string().optional(),
        lastPeriod: z.string().optional(),
        category: z.enum(['internal', 'public', 'private', 'section']).optional(),
        variableNames: z.array(z.string()).optional(),
        source: z.string().optional(),
        subjectCode: z.string().optional(),
        timeUnit: z.string().optional(),
        discontinued: z.boolean().optional(),
        paths: z.array(z.array(z.object({
            id: z.string(),
            label: z.string()
        }))).optional(),
        links: z.array(z.object({
            rel: z.string(),
            hreflang: z.string(),
            href: z.string()
        }))
    })),
    page: z.object({
        pageNumber: z.number(),
        pageSize: z.number(),
        totalElements: z.number(),
        totalPages: z.number(),
        links: z.array(z.object({
            rel: z.string(),
            hreflang: z.string(),
            href: z.string()
        })).optional()
    }),
    links: z.array(z.object({
        rel: z.string(),
        hreflang: z.string(),
        href: z.string()
    }))
});
export const DatasetSchema = z.object({
    version: z.literal('2.0'),
    class: z.literal('dataset'),
    id: z.array(z.string()),
    label: z.string(),
    source: z.string().optional(),
    updated: z.string().optional(),
    size: z.array(z.number()),
    dimension: z.record(z.object({
        label: z.string(),
        category: z.object({
            index: z.record(z.number()),
            label: z.record(z.string())
        }),
        extension: z.object({
            elimination: z.boolean().optional(),
            eliminationValueCode: z.string().optional()
        }).optional()
    })),
    value: z.array(z.number().nullable()).nullable().optional(),
    extension: z.object({
        px: z.record(z.any()).optional(),
        contact: z.array(z.object({
            name: z.string().optional(),
            mail: z.string().optional(),
            phone: z.string().optional()
        })).optional(),
        notes: z.array(z.object({
            text: z.string(),
            mandatory: z.boolean()
        })).optional()
    }).optional()
});
//# sourceMappingURL=types.js.map