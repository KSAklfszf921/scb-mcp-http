import { Protocol, type ProtocolOptions, type RequestOptions } from '../shared/protocol.js';
import type { Transport } from '../shared/transport.js';
import { type CallToolRequest, CallToolResultSchema, type ClientCapabilities, type ClientNotification, type ClientRequest, type ClientResult, type CompatibilityCallToolResultSchema, type CompleteRequest, type GetPromptRequest, type Implementation, type ListPromptsRequest, type ListResourcesRequest, type ListResourceTemplatesRequest, type ListToolsRequest, type LoggingLevel, type Notification, type ReadResourceRequest, type Request, type Result, type ServerCapabilities, type SubscribeRequest, type UnsubscribeRequest } from '../types.js';
import type { jsonSchemaValidator } from '../validation/types.js';
import { ZodLiteral, ZodObject, z } from 'zod';
import type { RequestHandlerExtra } from '../shared/protocol.js';
export type ClientOptions = ProtocolOptions & {
    /**
     * Capabilities to advertise as being supported by this client.
     */
    capabilities?: ClientCapabilities;
    /**
     * JSON Schema validator for tool output validation.
     *
     * The validator is used to validate structured content returned by tools
     * against their declared output schemas.
     *
     * @default AjvJsonSchemaValidator
     *
     * @example
     * ```typescript
     * // ajv
     * const client = new Client(
     *   { name: 'my-client', version: '1.0.0' },
     *   {
     *     capabilities: {},
     *     jsonSchemaValidator: new AjvJsonSchemaValidator()
     *   }
     * );
     *
     * // @cfworker/json-schema
     * const client = new Client(
     *   { name: 'my-client', version: '1.0.0' },
     *   {
     *     capabilities: {},
     *     jsonSchemaValidator: new CfWorkerJsonSchemaValidator()
     *   }
     * );
     * ```
     */
    jsonSchemaValidator?: jsonSchemaValidator;
};
/**
 * An MCP client on top of a pluggable transport.
 *
 * The client will automatically begin the initialization flow with the server when connect() is called.
 *
 * To use with custom types, extend the base Request/Notification/Result types and pass them as type parameters:
 *
 * ```typescript
 * // Custom schemas
 * const CustomRequestSchema = RequestSchema.extend({...})
 * const CustomNotificationSchema = NotificationSchema.extend({...})
 * const CustomResultSchema = ResultSchema.extend({...})
 *
 * // Type aliases
 * type CustomRequest = z.infer<typeof CustomRequestSchema>
 * type CustomNotification = z.infer<typeof CustomNotificationSchema>
 * type CustomResult = z.infer<typeof CustomResultSchema>
 *
 * // Create typed client
 * const client = new Client<CustomRequest, CustomNotification, CustomResult>({
 *   name: "CustomClient",
 *   version: "1.0.0"
 * })
 * ```
 */
export declare class Client<RequestT extends Request = Request, NotificationT extends Notification = Notification, ResultT extends Result = Result> extends Protocol<ClientRequest | RequestT, ClientNotification | NotificationT, ClientResult | ResultT> {
    private _clientInfo;
    private _serverCapabilities?;
    private _serverVersion?;
    private _capabilities;
    private _instructions?;
    private _jsonSchemaValidator;
    private _cachedToolOutputValidators;
    /**
     * Initializes this client with the given name and version information.
     */
    constructor(_clientInfo: Implementation, options?: ClientOptions);
    /**
     * Registers new capabilities. This can only be called before connecting to a transport.
     *
     * The new capabilities will be merged with any existing capabilities previously given (e.g., at initialization).
     */
    registerCapabilities(capabilities: ClientCapabilities): void;
    /**
     * Override request handler registration to enforce client-side validation for elicitation.
     */
    setRequestHandler<T extends ZodObject<{
        method: ZodLiteral<string>;
    }>>(requestSchema: T, handler: (request: z.infer<T>, extra: RequestHandlerExtra<ClientRequest | RequestT, ClientNotification | NotificationT>) => ClientResult | ResultT | Promise<ClientResult | ResultT>): void;
    protected assertCapability(capability: keyof ServerCapabilities, method: string): void;
    connect(transport: Transport, options?: RequestOptions): Promise<void>;
    /**
     * After initialization has completed, this will be populated with the server's reported capabilities.
     */
    getServerCapabilities(): ServerCapabilities | undefined;
    /**
     * After initialization has completed, this will be populated with information about the server's name and version.
     */
    getServerVersion(): Implementation | undefined;
    /**
     * After initialization has completed, this may be populated with information about the server's instructions.
     */
    getInstructions(): string | undefined;
    protected assertCapabilityForMethod(method: RequestT['method']): void;
    protected assertNotificationCapability(method: NotificationT['method']): void;
    protected assertRequestHandlerCapability(method: string): void;
    ping(options?: RequestOptions): Promise<{
        _meta?: Record<string, unknown> | undefined;
    }>;
    complete(params: CompleteRequest['params'], options?: RequestOptions): Promise<z.objectOutputType<z.objectUtil.extendShape<{
        _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, {
        completion: ZodObject<{
            values: z.ZodArray<z.ZodString, "many">;
            total: z.ZodOptional<z.ZodNumber>;
            hasMore: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            values: z.ZodArray<z.ZodString, "many">;
            total: z.ZodOptional<z.ZodNumber>;
            hasMore: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            values: z.ZodArray<z.ZodString, "many">;
            total: z.ZodOptional<z.ZodNumber>;
            hasMore: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>;
    }>, z.ZodTypeAny, "passthrough">>;
    setLoggingLevel(level: LoggingLevel, options?: RequestOptions): Promise<{
        _meta?: Record<string, unknown> | undefined;
    }>;
    getPrompt(params: GetPromptRequest['params'], options?: RequestOptions): Promise<z.objectOutputType<z.objectUtil.extendShape<{
        _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, {
        description: z.ZodOptional<z.ZodString>;
        messages: z.ZodArray<ZodObject<{
            role: z.ZodEnum<["user", "assistant"]>;
            content: z.ZodUnion<[ZodObject<{
                type: ZodLiteral<"text">;
                text: z.ZodString;
                _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            }, "strip", z.ZodTypeAny, {
                type: "text";
                text: string;
                _meta?: Record<string, unknown> | undefined;
            }, {
                type: "text";
                text: string;
                _meta?: Record<string, unknown> | undefined;
            }>, ZodObject<{
                type: ZodLiteral<"image">;
                data: z.ZodEffects<z.ZodString, string, string>;
                mimeType: z.ZodString;
                _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            }, "strip", z.ZodTypeAny, {
                type: "image";
                data: string;
                mimeType: string;
                _meta?: Record<string, unknown> | undefined;
            }, {
                type: "image";
                data: string;
                mimeType: string;
                _meta?: Record<string, unknown> | undefined;
            }>, ZodObject<{
                type: ZodLiteral<"audio">;
                data: z.ZodEffects<z.ZodString, string, string>;
                mimeType: z.ZodString;
                _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            }, "strip", z.ZodTypeAny, {
                type: "audio";
                data: string;
                mimeType: string;
                _meta?: Record<string, unknown> | undefined;
            }, {
                type: "audio";
                data: string;
                mimeType: string;
                _meta?: Record<string, unknown> | undefined;
            }>, ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
                name: z.ZodString;
                title: z.ZodOptional<z.ZodString>;
            }, {
                uri: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                mimeType: z.ZodOptional<z.ZodString>;
                _meta: z.ZodOptional<ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
            }>, {
                icons: z.ZodOptional<z.ZodArray<ZodObject<{
                    src: z.ZodString;
                    mimeType: z.ZodOptional<z.ZodString>;
                    sizes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    src: string;
                    mimeType?: string | undefined;
                    sizes?: string[] | undefined;
                }, {
                    src: string;
                    mimeType?: string | undefined;
                    sizes?: string[] | undefined;
                }>, "many">>;
            }>, {
                type: ZodLiteral<"resource_link">;
            }>, "strip", z.ZodTypeAny, {
                type: "resource_link";
                name: string;
                uri: string;
                _meta?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
                mimeType?: string | undefined;
                icons?: {
                    src: string;
                    mimeType?: string | undefined;
                    sizes?: string[] | undefined;
                }[] | undefined;
                title?: string | undefined;
                description?: string | undefined;
            }, {
                type: "resource_link";
                name: string;
                uri: string;
                _meta?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
                mimeType?: string | undefined;
                icons?: {
                    src: string;
                    mimeType?: string | undefined;
                    sizes?: string[] | undefined;
                }[] | undefined;
                title?: string | undefined;
                description?: string | undefined;
            }>, ZodObject<{
                type: ZodLiteral<"resource">;
                resource: z.ZodUnion<[ZodObject<z.objectUtil.extendShape<{
                    uri: z.ZodString;
                    mimeType: z.ZodOptional<z.ZodString>;
                    _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                }, {
                    text: z.ZodString;
                }>, "strip", z.ZodTypeAny, {
                    uri: string;
                    text: string;
                    _meta?: Record<string, unknown> | undefined;
                    mimeType?: string | undefined;
                }, {
                    uri: string;
                    text: string;
                    _meta?: Record<string, unknown> | undefined;
                    mimeType?: string | undefined;
                }>, ZodObject<z.objectUtil.extendShape<{
                    uri: z.ZodString;
                    mimeType: z.ZodOptional<z.ZodString>;
                    _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                }, {
                    blob: z.ZodEffects<z.ZodString, string, string>;
                }>, "strip", z.ZodTypeAny, {
                    uri: string;
                    blob: string;
                    _meta?: Record<string, unknown> | undefined;
                    mimeType?: string | undefined;
                }, {
                    uri: string;
                    blob: string;
                    _meta?: Record<string, unknown> | undefined;
                    mimeType?: string | undefined;
                }>]>;
                _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            }, "strip", z.ZodTypeAny, {
                type: "resource";
                resource: {
                    uri: string;
                    text: string;
                    _meta?: Record<string, unknown> | undefined;
                    mimeType?: string | undefined;
                } | {
                    uri: string;
                    blob: string;
                    _meta?: Record<string, unknown> | undefined;
                    mimeType?: string | undefined;
                };
                _meta?: Record<string, unknown> | undefined;
            }, {
                type: "resource";
                resource: {
                    uri: string;
                    text: string;
                    _meta?: Record<string, unknown> | undefined;
                    mimeType?: string | undefined;
                } | {
                    uri: string;
                    blob: string;
                    _meta?: Record<string, unknown> | undefined;
                    mimeType?: string | undefined;
                };
                _meta?: Record<string, unknown> | undefined;
            }>]>;
        }, "strip", z.ZodTypeAny, {
            role: "user" | "assistant";
            content: {
                type: "text";
                text: string;
                _meta?: Record<string, unknown> | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                _meta?: Record<string, unknown> | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                _meta?: Record<string, unknown> | undefined;
            } | {
                type: "resource";
                resource: {
                    uri: string;
                    text: string;
                    _meta?: Record<string, unknown> | undefined;
                    mimeType?: string | undefined;
                } | {
                    uri: string;
                    blob: string;
                    _meta?: Record<string, unknown> | undefined;
                    mimeType?: string | undefined;
                };
                _meta?: Record<string, unknown> | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                _meta?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
                mimeType?: string | undefined;
                icons?: {
                    src: string;
                    mimeType?: string | undefined;
                    sizes?: string[] | undefined;
                }[] | undefined;
                title?: string | undefined;
                description?: string | undefined;
            };
        }, {
            role: "user" | "assistant";
            content: {
                type: "text";
                text: string;
                _meta?: Record<string, unknown> | undefined;
            } | {
                type: "image";
                data: string;
                mimeType: string;
                _meta?: Record<string, unknown> | undefined;
            } | {
                type: "audio";
                data: string;
                mimeType: string;
                _meta?: Record<string, unknown> | undefined;
            } | {
                type: "resource";
                resource: {
                    uri: string;
                    text: string;
                    _meta?: Record<string, unknown> | undefined;
                    mimeType?: string | undefined;
                } | {
                    uri: string;
                    blob: string;
                    _meta?: Record<string, unknown> | undefined;
                    mimeType?: string | undefined;
                };
                _meta?: Record<string, unknown> | undefined;
            } | {
                type: "resource_link";
                name: string;
                uri: string;
                _meta?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
                mimeType?: string | undefined;
                icons?: {
                    src: string;
                    mimeType?: string | undefined;
                    sizes?: string[] | undefined;
                }[] | undefined;
                title?: string | undefined;
                description?: string | undefined;
            };
        }>, "many">;
    }>, z.ZodTypeAny, "passthrough">>;
    listPrompts(params?: ListPromptsRequest['params'], options?: RequestOptions): Promise<z.objectOutputType<z.objectUtil.extendShape<z.objectUtil.extendShape<{
        _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, {
        nextCursor: z.ZodOptional<z.ZodString>;
    }>, {
        prompts: z.ZodArray<ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
            name: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
        }, {
            description: z.ZodOptional<z.ZodString>;
            arguments: z.ZodOptional<z.ZodArray<ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                required: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                description?: string | undefined;
                required?: boolean | undefined;
            }, {
                name: string;
                description?: string | undefined;
                required?: boolean | undefined;
            }>, "many">>;
            _meta: z.ZodOptional<ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
        }>, {
            icons: z.ZodOptional<z.ZodArray<ZodObject<{
                src: z.ZodString;
                mimeType: z.ZodOptional<z.ZodString>;
                sizes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }, {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }>, "many">>;
        }>, "strip", z.ZodTypeAny, {
            name: string;
            _meta?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
            icons?: {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }[] | undefined;
            title?: string | undefined;
            description?: string | undefined;
            arguments?: {
                name: string;
                description?: string | undefined;
                required?: boolean | undefined;
            }[] | undefined;
        }, {
            name: string;
            _meta?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
            icons?: {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }[] | undefined;
            title?: string | undefined;
            description?: string | undefined;
            arguments?: {
                name: string;
                description?: string | undefined;
                required?: boolean | undefined;
            }[] | undefined;
        }>, "many">;
    }>, z.ZodTypeAny, "passthrough">>;
    listResources(params?: ListResourcesRequest['params'], options?: RequestOptions): Promise<z.objectOutputType<z.objectUtil.extendShape<z.objectUtil.extendShape<{
        _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, {
        nextCursor: z.ZodOptional<z.ZodString>;
    }>, {
        resources: z.ZodArray<ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
            name: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
        }, {
            uri: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            mimeType: z.ZodOptional<z.ZodString>;
            _meta: z.ZodOptional<ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
        }>, {
            icons: z.ZodOptional<z.ZodArray<ZodObject<{
                src: z.ZodString;
                mimeType: z.ZodOptional<z.ZodString>;
                sizes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }, {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }>, "many">>;
        }>, "strip", z.ZodTypeAny, {
            name: string;
            uri: string;
            _meta?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
            mimeType?: string | undefined;
            icons?: {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }[] | undefined;
            title?: string | undefined;
            description?: string | undefined;
        }, {
            name: string;
            uri: string;
            _meta?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
            mimeType?: string | undefined;
            icons?: {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }[] | undefined;
            title?: string | undefined;
            description?: string | undefined;
        }>, "many">;
    }>, z.ZodTypeAny, "passthrough">>;
    listResourceTemplates(params?: ListResourceTemplatesRequest['params'], options?: RequestOptions): Promise<z.objectOutputType<z.objectUtil.extendShape<z.objectUtil.extendShape<{
        _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, {
        nextCursor: z.ZodOptional<z.ZodString>;
    }>, {
        resourceTemplates: z.ZodArray<ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
            name: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
        }, {
            uriTemplate: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            mimeType: z.ZodOptional<z.ZodString>;
            _meta: z.ZodOptional<ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
        }>, {
            icons: z.ZodOptional<z.ZodArray<ZodObject<{
                src: z.ZodString;
                mimeType: z.ZodOptional<z.ZodString>;
                sizes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }, {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }>, "many">>;
        }>, "strip", z.ZodTypeAny, {
            name: string;
            uriTemplate: string;
            _meta?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
            mimeType?: string | undefined;
            icons?: {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }[] | undefined;
            title?: string | undefined;
            description?: string | undefined;
        }, {
            name: string;
            uriTemplate: string;
            _meta?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
            mimeType?: string | undefined;
            icons?: {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }[] | undefined;
            title?: string | undefined;
            description?: string | undefined;
        }>, "many">;
    }>, z.ZodTypeAny, "passthrough">>;
    readResource(params: ReadResourceRequest['params'], options?: RequestOptions): Promise<z.objectOutputType<z.objectUtil.extendShape<{
        _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, {
        contents: z.ZodArray<z.ZodUnion<[ZodObject<z.objectUtil.extendShape<{
            uri: z.ZodString;
            mimeType: z.ZodOptional<z.ZodString>;
            _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, {
            text: z.ZodString;
        }>, "strip", z.ZodTypeAny, {
            uri: string;
            text: string;
            _meta?: Record<string, unknown> | undefined;
            mimeType?: string | undefined;
        }, {
            uri: string;
            text: string;
            _meta?: Record<string, unknown> | undefined;
            mimeType?: string | undefined;
        }>, ZodObject<z.objectUtil.extendShape<{
            uri: z.ZodString;
            mimeType: z.ZodOptional<z.ZodString>;
            _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, {
            blob: z.ZodEffects<z.ZodString, string, string>;
        }>, "strip", z.ZodTypeAny, {
            uri: string;
            blob: string;
            _meta?: Record<string, unknown> | undefined;
            mimeType?: string | undefined;
        }, {
            uri: string;
            blob: string;
            _meta?: Record<string, unknown> | undefined;
            mimeType?: string | undefined;
        }>]>, "many">;
    }>, z.ZodTypeAny, "passthrough">>;
    subscribeResource(params: SubscribeRequest['params'], options?: RequestOptions): Promise<{
        _meta?: Record<string, unknown> | undefined;
    }>;
    unsubscribeResource(params: UnsubscribeRequest['params'], options?: RequestOptions): Promise<{
        _meta?: Record<string, unknown> | undefined;
    }>;
    callTool(params: CallToolRequest['params'], resultSchema?: typeof CallToolResultSchema | typeof CompatibilityCallToolResultSchema, options?: RequestOptions): Promise<z.objectOutputType<z.objectUtil.extendShape<{
        _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, {
        content: z.ZodDefault<z.ZodArray<z.ZodUnion<[ZodObject<{
            type: ZodLiteral<"text">;
            text: z.ZodString;
            _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
            _meta?: Record<string, unknown> | undefined;
        }, {
            type: "text";
            text: string;
            _meta?: Record<string, unknown> | undefined;
        }>, ZodObject<{
            type: ZodLiteral<"image">;
            data: z.ZodEffects<z.ZodString, string, string>;
            mimeType: z.ZodString;
            _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            type: "image";
            data: string;
            mimeType: string;
            _meta?: Record<string, unknown> | undefined;
        }, {
            type: "image";
            data: string;
            mimeType: string;
            _meta?: Record<string, unknown> | undefined;
        }>, ZodObject<{
            type: ZodLiteral<"audio">;
            data: z.ZodEffects<z.ZodString, string, string>;
            mimeType: z.ZodString;
            _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            type: "audio";
            data: string;
            mimeType: string;
            _meta?: Record<string, unknown> | undefined;
        }, {
            type: "audio";
            data: string;
            mimeType: string;
            _meta?: Record<string, unknown> | undefined;
        }>, ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<z.objectUtil.extendShape<{
            name: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
        }, {
            uri: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            mimeType: z.ZodOptional<z.ZodString>;
            _meta: z.ZodOptional<ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
        }>, {
            icons: z.ZodOptional<z.ZodArray<ZodObject<{
                src: z.ZodString;
                mimeType: z.ZodOptional<z.ZodString>;
                sizes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }, {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }>, "many">>;
        }>, {
            type: ZodLiteral<"resource_link">;
        }>, "strip", z.ZodTypeAny, {
            type: "resource_link";
            name: string;
            uri: string;
            _meta?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
            mimeType?: string | undefined;
            icons?: {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }[] | undefined;
            title?: string | undefined;
            description?: string | undefined;
        }, {
            type: "resource_link";
            name: string;
            uri: string;
            _meta?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
            mimeType?: string | undefined;
            icons?: {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }[] | undefined;
            title?: string | undefined;
            description?: string | undefined;
        }>, ZodObject<{
            type: ZodLiteral<"resource">;
            resource: z.ZodUnion<[ZodObject<z.objectUtil.extendShape<{
                uri: z.ZodString;
                mimeType: z.ZodOptional<z.ZodString>;
                _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            }, {
                text: z.ZodString;
            }>, "strip", z.ZodTypeAny, {
                uri: string;
                text: string;
                _meta?: Record<string, unknown> | undefined;
                mimeType?: string | undefined;
            }, {
                uri: string;
                text: string;
                _meta?: Record<string, unknown> | undefined;
                mimeType?: string | undefined;
            }>, ZodObject<z.objectUtil.extendShape<{
                uri: z.ZodString;
                mimeType: z.ZodOptional<z.ZodString>;
                _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            }, {
                blob: z.ZodEffects<z.ZodString, string, string>;
            }>, "strip", z.ZodTypeAny, {
                uri: string;
                blob: string;
                _meta?: Record<string, unknown> | undefined;
                mimeType?: string | undefined;
            }, {
                uri: string;
                blob: string;
                _meta?: Record<string, unknown> | undefined;
                mimeType?: string | undefined;
            }>]>;
            _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            type: "resource";
            resource: {
                uri: string;
                text: string;
                _meta?: Record<string, unknown> | undefined;
                mimeType?: string | undefined;
            } | {
                uri: string;
                blob: string;
                _meta?: Record<string, unknown> | undefined;
                mimeType?: string | undefined;
            };
            _meta?: Record<string, unknown> | undefined;
        }, {
            type: "resource";
            resource: {
                uri: string;
                text: string;
                _meta?: Record<string, unknown> | undefined;
                mimeType?: string | undefined;
            } | {
                uri: string;
                blob: string;
                _meta?: Record<string, unknown> | undefined;
                mimeType?: string | undefined;
            };
            _meta?: Record<string, unknown> | undefined;
        }>]>, "many">>;
        structuredContent: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        isError: z.ZodOptional<z.ZodBoolean>;
    }>, z.ZodTypeAny, "passthrough"> | z.objectOutputType<z.objectUtil.extendShape<{
        _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, {
        toolResult: z.ZodUnknown;
    }>, z.ZodTypeAny, "passthrough">>;
    /**
     * Cache validators for tool output schemas.
     * Called after listTools() to pre-compile validators for better performance.
     */
    private cacheToolOutputSchemas;
    /**
     * Get cached validator for a tool
     */
    private getToolOutputValidator;
    listTools(params?: ListToolsRequest['params'], options?: RequestOptions): Promise<z.objectOutputType<z.objectUtil.extendShape<z.objectUtil.extendShape<{
        _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, {
        nextCursor: z.ZodOptional<z.ZodString>;
    }>, {
        tools: z.ZodArray<ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
            name: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
        }, {
            description: z.ZodOptional<z.ZodString>;
            inputSchema: ZodObject<{
                type: ZodLiteral<"object">;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<object, z.ZodTypeDef, object>>>;
                required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                type: "object";
                required?: string[] | undefined;
                properties?: Record<string, object> | undefined;
            }, {
                type: "object";
                required?: string[] | undefined;
                properties?: Record<string, object> | undefined;
            }>;
            outputSchema: z.ZodOptional<ZodObject<{
                type: ZodLiteral<"object">;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<object, z.ZodTypeDef, object>>>;
                required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                additionalProperties: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                type: "object";
                required?: string[] | undefined;
                properties?: Record<string, object> | undefined;
                additionalProperties?: boolean | undefined;
            }, {
                type: "object";
                required?: string[] | undefined;
                properties?: Record<string, object> | undefined;
                additionalProperties?: boolean | undefined;
            }>>;
            annotations: z.ZodOptional<ZodObject<{
                title: z.ZodOptional<z.ZodString>;
                readOnlyHint: z.ZodOptional<z.ZodBoolean>;
                destructiveHint: z.ZodOptional<z.ZodBoolean>;
                idempotentHint: z.ZodOptional<z.ZodBoolean>;
                openWorldHint: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                title?: string | undefined;
                readOnlyHint?: boolean | undefined;
                destructiveHint?: boolean | undefined;
                idempotentHint?: boolean | undefined;
                openWorldHint?: boolean | undefined;
            }, {
                title?: string | undefined;
                readOnlyHint?: boolean | undefined;
                destructiveHint?: boolean | undefined;
                idempotentHint?: boolean | undefined;
                openWorldHint?: boolean | undefined;
            }>>;
            _meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }>, {
            icons: z.ZodOptional<z.ZodArray<ZodObject<{
                src: z.ZodString;
                mimeType: z.ZodOptional<z.ZodString>;
                sizes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }, {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }>, "many">>;
        }>, "strip", z.ZodTypeAny, {
            name: string;
            inputSchema: {
                type: "object";
                required?: string[] | undefined;
                properties?: Record<string, object> | undefined;
            };
            _meta?: Record<string, unknown> | undefined;
            icons?: {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }[] | undefined;
            title?: string | undefined;
            description?: string | undefined;
            outputSchema?: {
                type: "object";
                required?: string[] | undefined;
                properties?: Record<string, object> | undefined;
                additionalProperties?: boolean | undefined;
            } | undefined;
            annotations?: {
                title?: string | undefined;
                readOnlyHint?: boolean | undefined;
                destructiveHint?: boolean | undefined;
                idempotentHint?: boolean | undefined;
                openWorldHint?: boolean | undefined;
            } | undefined;
        }, {
            name: string;
            inputSchema: {
                type: "object";
                required?: string[] | undefined;
                properties?: Record<string, object> | undefined;
            };
            _meta?: Record<string, unknown> | undefined;
            icons?: {
                src: string;
                mimeType?: string | undefined;
                sizes?: string[] | undefined;
            }[] | undefined;
            title?: string | undefined;
            description?: string | undefined;
            outputSchema?: {
                type: "object";
                required?: string[] | undefined;
                properties?: Record<string, object> | undefined;
                additionalProperties?: boolean | undefined;
            } | undefined;
            annotations?: {
                title?: string | undefined;
                readOnlyHint?: boolean | undefined;
                destructiveHint?: boolean | undefined;
                idempotentHint?: boolean | undefined;
                openWorldHint?: boolean | undefined;
            } | undefined;
        }>, "many">;
    }>, z.ZodTypeAny, "passthrough">>;
    sendRootsListChanged(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map