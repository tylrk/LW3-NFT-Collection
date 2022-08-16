export default function handler(req, res) {
    // Get the tokenId from query params
    const tokenId = req.query.tokenId;

    // As all the images are uploaded to github, we cab extract the images from github directly
    const image_url = "https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/";
    // The api is sending back metadata for a CryptoDev
    // To make our collection compatible with OpenSea, we need to follow some Metadata Standards when sending back the response from the api
    res.status(200).json({
        name: "CryptoDev #" + tokenId,
        description: "CryptoDevs is a collection of developers in Crypto",
        image: image_url + tokenId + ".svg",
    });
}

// 