-- Add more top Solana tokens to reach 100 tokens
-- These are popular tokens from the Solana ecosystem

INSERT INTO public.solana_tokens (mint_address, name, symbol, description, decimals, is_active) VALUES
-- DeFi tokens
('HxRELUQfvvjToVbacjr9YECdfQMUqGgPYB68jVDYxkbr', 'Parcl', 'PRCL', 'Real estate protocol on Solana', 6, true),
('kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6', 'KIN', 'KIN', 'Kin cryptocurrency', 5, true),
('nosXBVoaCTtYdLvKY6Csb4AC8JCdQKKAaWYtx2ZMoo7', 'Nosana', 'NOS', 'GPU compute network', 6, true),
('DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ', 'Dust Protocol', 'DUST', 'Gamified NFT marketplace', 9, true),
('SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y', 'GenesysGo Shadow', 'SHDW', 'Decentralized storage', 9, true),
('METAewgxyPbgwsseH8T16a39CQ5VyVxZi9zXiDPY18m', 'Metaplex', 'META', 'NFT standard for Solana', 9, true),
('RLBxxFkseAZ4RgJH3Sqn8jXxhmGoz9jWxDNJMh8pL7a', 'Rollbit Coin', 'RLB', 'Casino and NFT platform', 2, true),
('Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1', 'Saber', 'SBR', 'Stableswap protocol', 6, true),

-- Memecoins and community tokens
('MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5', 'cat in a dogs world', 'MEW', 'Cat themed memecoin', 5, true),
('5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC', 'Silly Dragon', 'SILLY', 'Dragon themed memecoin', 9, true),
('2weMjPLLybRMMva1fM3U31goWWrCpF59CHWNhnCJ9Vyh', 'POPCAT', 'POPCAT', 'Popular cat meme token', 9, true),
('ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY', 'Moutai', 'MOUTAI', 'Community token', 6, true),

-- Infrastructure and validators
('BLZEEuZUBVqFhj8adcCFPJvPVCiCyVmh3hkJMrU8KuJA', 'Blaze', 'BLZE', 'Solana validator', 9, true),
('MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac', 'Mango', 'MNGO', 'Decentralized trading platform', 6, true),
('LSTxxxnJzKDFSLr4dUkPcmCf5VyryEqzPLz5j4bpxFp', 'Liquid Staking Token', 'LST', 'Liquid staking derivative', 9, true),
('TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6', 'Tensor', 'TNSR', 'NFT marketplace', 9, true),
('zebeczgi5fSEtbpfQKVZKCJ3WgYXxjkMUkNNx7fLKAF', 'Zebec Protocol', 'ZBC', 'Stream payments', 9, true),

-- Gaming and metaverse
('ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx', 'Star Atlas', 'ATLAS', 'Space strategy MMO', 8, true),
('poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk', 'Star Atlas DAO', 'POLIS', 'Governance token for Star Atlas', 8, true),
('GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz', 'Genopets', 'GENE', 'Move-to-earn NFT game', 9, true),
('8upjSpvjcdpuzhfR1zriwg5NXkwDruejqNE9WNbPRtyA', 'GME', 'GME', 'Gaming token', 9, true),
('AqJteJYwC5KYcbFf1SjcqgJJVMGKhcZmfVA7e3ZBvDwX', 'Aurory', 'AURY', 'Gaming ecosystem', 9, true),

-- More DeFi
('CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT', 'Cashio', 'CASH', 'Dollar stablecoin', 6, true),
('PoRTjZMPXb9T7dyU7tpLEZRQj7e6ssfAE62j2oQuc6y', 'Port Finance', 'PORT', 'Lending protocol', 6, true),
('SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp', 'Solend', 'SLND', 'Algorithmic lending', 6, true),
('SLRSSpSLUTP7okbCUBYStWCo1vUgyt775faPqz8HUMr', 'Solrise Finance', 'SLRS', 'Decentralized fund management', 6, true),
('BRGq5UrMzbPr3GLVxpvMR5Hddsk7x2Nq2EYnkwvQMVvW', 'Bridge Oracle', 'BRG', 'Price oracle', 9, true),

-- Layer 2 and infrastructure
('SLCLww7nc1PD2gQPQdGayHviVVcpMthnqUz2iWKhNQV', 'Solice', 'SLC', 'Virtual reality metaverse', 6, true),
('FbC6K13MzHvN42bXrtGaWsvZY9fxrackRSZcBGfjPc7m', 'Social', 'SOCIAL', 'Social token', 9, true),
('BLwTnYKqf7u4qjgZrrsKeNs2EzWkMLqVCu6j8iHyrNA3', 'Bonfida', 'FIDA', 'Serum DEX interface', 6, true),
('CHXZhaSo8Zz6vPYyR5Y6kzomZibvZfKkQ8qkMHCNQYXj', 'Chicks', 'CHICKS', 'Gaming token', 9, true),

-- More tokens
('MERLuDFBMmsHnsBPZw2sDQZHvXFMwp8EdjudcU2HKky', 'MERL', 'MERL', 'Merlin protocol', 6, true),
('LFNTYraetVioAPnGJht4yNg2aUZFXR776cMeN9VMjXp', 'Lifinity', 'LFNTY', 'Proactive market maker', 6, true),
('MoonEoXttTypQHxZKwYu8M3eXY19wZmvwABGt7nRkrv', 'Mooney', 'MOONEY', 'Space exploration', 9, true),
('METAmTMXwdb8gYzyCPfXXFmZZw4rUsXX58PNsDg7zjL', 'Media Network', 'MEDIA', 'Decentralized CDN', 6, true),

-- Additional quality tokens
('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 'SAMO', 'SAMO', 'Samoyed coin', 9, true),
('GDfnEsia2WLAW5t8yx2X5j2mkfA74i5kwGdDuZHt7XmG', 'GRAPE', 'GRAPE', 'Social token', 6, true),
('AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB', 'GST', 'GST', 'Gaming token', 9, true),
('GTH3wG3NErjwcf7VGCoXEXkgXSHvYhx5gtATeeM5JAS1', 'Green Satoshi Token', 'GST', 'Move-to-earn', 9, true),

-- More DeFi and trading
('FANTafPFBAt93BNJVpdu25pGPmca3RfwdsDsRrT3LX1', 'FANT', 'FANT', 'Fantasy sports', 6, true),
('6gnCPhXtLnUD76HjQuSYPENLSZdG8RvDB1pTLM5aLSJA', 'AUDIO', 'AUDIO', 'Music streaming', 8, true),
('C98A4nkJXhpVZNAZdHUA95RpTF3T4whtQubL3YobiUX9', 'Coin98', 'C98', 'Multi-chain wallet', 6, true),
('DMTJpQX6MVYYWRZZFLktvYWjQkZEiMQfaSW7CsHdPvZh', 'Dymension', 'DYM', 'Modular blockchain', 6, true),

-- More ecosystem tokens
('FRG1iFsyZRzyybHKSbfafeVHK6jPTEeHXx6TQG8qNmKj', 'Francium', 'FRA', 'Yield farming', 8, true),
('GDpSUdGNwUZCnYDpksPJBHYSsMwstnqeULHaEQJyRJjg', 'GRIND', 'GRIND', 'Gaming rewards', 9, true),
('FYfQ9uaRaYvRiaEGUmct45F9WKam3BYXArTrotnRtRcp', 'Fronk', 'FRONK', 'Community memecoin', 5, true),
('9j6USu6mjsNc7HL2gVMqKUhqPYF2w9sJpRpecEdh6Exa', 'CHEEMS', 'CHEEMS', 'Dog memecoin', 4, true),

-- Additional gaming and NFT
('BM4GTiJPhsqnH5vNfExx2UvEeZhDrcqfDaHMHCYmgxWp', 'BMBO', 'BMBO', 'Arcade gaming', 9, true),
('ANJSYYCcFNxHvUWdvxyK8vwXELQvJBk2dT66N8sGWKLr', 'ANSY', 'ANSY', 'Analytics platform', 6, true),
('USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA', 'Wrapped USDS', 'wUSDT', 'Stablecoin', 6, true),
('BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k', 'COPE', 'COPE', 'Trading competition', 6, true),

-- More recent popular tokens
('3XTt5HCXHYznwFNxUKvKaTTxE1JCqvs68Vj3H1kYQ5yC', 'SCY', 'SCY', 'Solciety', 6, true),
('FnKE9n6aGjQoNWRBZXy4RW6LZVao7qwBonUbiD7edUmZ', 'SHDW', 'SHDW', 'Shadow storage', 9, true),
('RLYv2ubRMDLcGG2UyvPmnPmkfuQTsMbg4Jtygc7dmnq', 'Rally', 'RLY', 'Creator economy', 9, true),
('9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E', 'BTC', 'BTC', 'Wrapped Bitcoin', 6, true),

-- Final additions
('DtBcAzCYpt7YN6cTpGm2xJWnF9Bqapm2qXTGCu5H3KMC', 'SLIM', 'SLIM', 'Solanium', 6, true),
('5WFSKSFp1Z6YDxGQFQsWBEhDPyqH7YNkJCFZgDZMRmNr', 'TULIP', 'TULIP', 'Yield aggregator', 6, true),
('SLSqMbKd5xvYbUCzWQvCbbxEBcNvVxnKgdJFcNRLSNe', 'SLRS', 'SLRS', 'Solrise', 6, true),
('CRYPToPqBc8Db6JvzhRpL5FtHxfBjMKy5H6YaFq8N2ML', 'CRYPTO', 'CRYPTO', 'Crypto project', 9, true),

-- Top trending tokens
('PoULeusq4vHDJPPB1eRLPVLVJ7CWXHZ2gGGiQkDEknb', 'POP', 'POP', 'Pop token', 9, true),
('B8BQj8R87wT5sCwJuYaY3DqBvNEHPjM6XCmQCx8TfY5s', 'BOOK', 'BOOK', 'BookIO', 6, true),
('3LDAW6SqvD7mZV8hCM4D3yWU8Rz7mZTYQfSQ5sVmWjD9', 'MYRO', 'MYRO', 'Myro memecoin', 9, true),
('9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM', 'ORCA', 'ORCA', 'ORCA token', 6, true)

ON CONFLICT (mint_address) DO NOTHING;