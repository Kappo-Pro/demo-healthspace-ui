import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import {
	WebTracerProvider,
	SimpleSpanProcessor,
	ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';

const provider = new WebTracerProvider({
	resource: new Resource({
		[SEMRESATTRS_SERVICE_NAME]: 'frontend_' + process.env.REACT_APP_ENV,
	}),
});
const exporter = new OTLPTraceExporter({
	url: process.env.REACT_APP_OPEN_TELEMETRY_SIGNOZ_URL,
});
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

provider.register({
	contextManager: new ZoneContextManager(),
});

registerInstrumentations({
	instrumentations: [
		getWebAutoInstrumentations(),
		new DocumentLoadInstrumentation(),
		new UserInteractionInstrumentation(),
		new XMLHttpRequestInstrumentation(),
		new FetchInstrumentation(),
	],
});
