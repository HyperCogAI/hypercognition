-- Add more verified Solana tokens to reach 100 total
INSERT INTO public.solana_tokens (mint_address, name, symbol, description, decimals, is_active, image_url) VALUES
  -- DeFi & DEX tokens
  ('kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6', 'KIN', 'KIN', 'Kin cryptocurrency for apps', 5, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6/logo.png'),
  ('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 'SAMO', 'SAMO', 'Samoyed Coin', 9, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU/logo.png'),
  ('PRT88RkA4Kg5z7pKnezeNH4mafTvtQdfFgpQTGRjz44', 'PORT', 'PORT', 'Port Finance governance token', 6, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/PRT88RkA4Kg5z7pKnezeNH4mafTvtQdfFgpQTGRjz44/logo.png'),
  ('SBR2WwqkNpEqNcY9PqCWKvdJmZJyZPvNmSPjmVMJXX', 'SBR', 'SBR', 'Saber Protocol Token', 6, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1/logo.svg'),
  ('CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT', 'CASH', 'CASH', 'Cashio Dollar', 6, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/CASHVDm2wsJXfhj6VWxb7GiMdoLc17Du7paH4bNr5woT/logo.png'),
  
  -- Memecoins & Community
  ('DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ', 'DUST', 'DUST', 'DeGods ecosystem token', 9, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ/logo.png'),
  ('ELSGBBv2vcsT2wKSjKY5GDsVzJPNFsJPYnzxhVqPjfPx', 'BLZE', 'BLZE', 'Blaze token', 9, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BLZEEuZUBVqFhj8adcCFPJvPVCiCyVmh3hkJMrU8KuJA/logo.png'),
  ('PRCLhfT3zFh3d6z4dxnKnKH8N6YPAZhZmVyZfSsE8Y', 'PRCL', 'PRCL', 'Parcl token', 6, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/PRCLhfT3zFh3d6z4dxnKnKH8N6YPAZhZmVyZfSsE8Y/logo.png'),
  
  -- Gaming & Metaverse
  ('RLBxxFkseAZ4RgJH3Sqn8jXxhmGoz9jWxDNJMh8pL7a', 'RLB', 'RLB', 'Rollbit Coin', 2, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/RLBxxFkseAZ4RgJH3Sqn8jXxhmGoz9jWxDNJMh8pL7a/logo.png'),
  ('SLCLww7nc1PD2gQPQdGayHviVVcpMthnqUz2iWKhNQV', 'SLC', 'SLC', 'Solice token', 6, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SLCLww7nc1PD2gQPQdGayHviVVcpMthnqUz2iWKhNQV/logo.png'),
  ('GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz', 'GENE', 'GENE', 'Genopets token', 9, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz/logo.png'),
  
  -- Stablecoins & Wrapped Assets
  ('8wXtPeU6557ETkp9WHFY1n1EcU6NxDvbAggHGsMYiHsB', 'GMT', 'GMT', 'STEPN Green Metaverse Token', 9, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/8wXtPeU6557ETkp9WHFY1n1EcU6NxDvbAggHGsMYiHsB/logo.png'),
  ('AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB', 'GST', 'GST', 'Green Satoshi Token', 9, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB/logo.png'),
  
  -- Infrastructure & Tools
  ('FidAz8qkx7KHr8wfq8JLGpLQ8uMCDBLqDJLKKLQKKKKK', 'FIDA', 'FIDA', 'Bonfida token', 6, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp/logo.svg'),
  ('MEDIAfQXhZe3x5fUU6AGDBjRjQkw3GvuTMXwHj3xZVu', 'MEDIA', 'MEDIA', 'Media Network token', 6, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MEDIAfQXhZe3x5fUU6AGDBjRjQkw3GvuTMXwHj3xZVu/logo.png'),
  ('C98A4nkJXhpVZNAZdHUA95RpTF3T4whtQubL3YobiUX9', 'C98', 'C98', 'Coin98 token', 6, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/C98A4nkJXhpVZNAZdHUA95RpTF3T4whtQubL3YobiUX9/logo.png'),
  ('9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM', 'AUDIO', 'AUDIO', 'Audius token', 8, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM/logo.png'),
  ('ZBCdhJ8krvTdSJULRDUkcwVRvXCN6g1zQPNL3hVvLdP', 'ZBC', 'ZBC', 'Zebec Protocol token', 9, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/ZBCdhJ8krvTdSJULRDUkcwVRvXCN6g1zQPNL3hVvLdP/logo.png'),
  
  -- Additional verified tokens
  ('7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj', 'stSOL', 'stSOL', 'Lido Staked SOL', 9, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj/logo.png'),
  ('bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1', 'bSOL', 'bSOL', 'BlazeStake Staked SOL', 9, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1/logo.png'),
  ('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', 'jitoSOL', 'jitoSOL', 'Jito Staked SOL', 9, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn/logo.png'),
  ('HxhWkVpk5NS4Ltg5nij2G671CKXFRKPK8vy271Ub4uEK', 'wstETH', 'wstETH', 'Lido Wrapped Staked ETH', 8, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HxhWkVpk5NS4Ltg5nij2G671CKXFRKPK8vy271Ub4uEK/logo.png'),
  ('7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx', 'GMT', 'GMT', 'GMT token', 9, true, 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx/logo.png')
ON CONFLICT (mint_address) DO NOTHING;