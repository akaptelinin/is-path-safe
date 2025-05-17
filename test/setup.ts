import {expect, vi} from "vitest";

globalThis.fetch = vi.fn(async () => {
    return new Response(JSON.stringify({message: "Success"}), {
        status: 200,
        headers: {"Content-Type": "application/json"}
    });
});

expect.extend({
    toBeTypeOf(received, argument) {
        const initialType = typeof received;
        const pass = initialType === argument;
        if (pass) {
            return {
                message: () => `expected ${received} to be of type ${argument}`,
                pass: true
            };
        } else {
            return {
                message: () =>
                    `expected ${received} to be of type ${argument}, but got ${initialType}`,
                pass: false
            };
        }
    }
});
