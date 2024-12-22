const nextConfig = {
    async redirects() {
        return [
            {
                source: "/",
                destination: "/VMBoard",
                permanent: true,
            },
        ];
    },
    reactStrictMode: true,
    output: "standalone",
    images: {
        unoptimized: true,
    },
    env: {
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    },
};

export default nextConfig;
