declare global {
	namespace NodeJS {
	  interface ProcessEnv {
		APP_ENV: string;
		V1_API_ENDPOINT: string;
		NEXT_PUBLIC_V1_WEBSOCKET_ENDPOINT: string;
	  }
	}
  }
  
  export {}
  