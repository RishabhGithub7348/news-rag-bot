import { v1APIAxios } from "@/config/axios";
import { AxiosHeaders } from "axios";
import { NextRequest, NextResponse } from "next/server";

function removeFrontEndAPIBaseURL(url: string): string {
	const FRONT_END_API_URL = "/api";

	if (!url.startsWith(FRONT_END_API_URL)) {
		throw new Error("Invalid endpoint");
	}

	const regex = new RegExp(`^${FRONT_END_API_URL}`);
	const targetUrl = process.env.V1_API_ENDPOINT + url.replace(regex, "");

	return targetUrl;
}

const proxyAPI = async (req: NextRequest) => {
	try {
		const { method, headers, nextUrl } = req;
		const searchParams = new URLSearchParams(nextUrl.search);
		const url = nextUrl.pathname;

		if (!url) {
			throw new Error("Invalid endpoint");
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let body: any = undefined;

		try {
			const contentType = req.headers.get("content-type");

			if (contentType?.includes("application/json")) {
				body = await req.json();
			} else if (contentType?.includes("multipart/form-data")) {
				body = await req.formData();
			}
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
		}

		const backendEndpoint = removeFrontEndAPIBaseURL(url);

		const axiosHeaders =  new AxiosHeaders();
		Object.keys(headers).forEach((key) => {
			axiosHeaders.setHeader(key, headers.get(key));
		});

		const response = await v1APIAxios({
			method,
			url: backendEndpoint,
			headers: axiosHeaders,
			params: searchParams,
			data: body,
		});

		const responseData = response.data;
		const status = response.status;

		const responseHeaders = new Headers();
		Object.keys(response.headers).forEach((key) => {
			responseHeaders.set(key, response.headers[key]);
		});

		responseHeaders.delete("Transfer-Encoding");
		responseHeaders.delete("Content-Length");

		return new NextResponse(JSON.stringify(responseData), {
			status: status,
			headers: responseHeaders,
		});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error("Proxy API Error:", error?.response?.data || error?.message || error);

		return new NextResponse(
			JSON.stringify({
				error: "There was a problem proxying the request",
				details: error?.response?.data || error?.message || "Unknown error",
			}),
			{ status: error?.response?.status || 500 }
		);
	}
};

export const GET = proxyAPI;
export const POST = proxyAPI;
export const PUT = proxyAPI;
export const PATCH = proxyAPI;
export const DELETE = proxyAPI;
export const HEAD = proxyAPI;
export const OPTIONS = proxyAPI;
