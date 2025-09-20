-- Insert sample user profiles for the Recent Community section
INSERT INTO user_profiles (user_id, display_name, username, bio) VALUES
  (gen_random_uuid(), 'Alex Chen', 'alexchen', 'DeFi enthusiast and early adopter'),
  (gen_random_uuid(), 'Sarah Miller', 'sarahm', 'Crypto trader focusing on AI agents'),
  (gen_random_uuid(), 'Mike Rodriguez', 'mikero', 'Blockchain developer and investor'),
  (gen_random_uuid(), 'Emma Johnson', 'emmaj', 'NFT collector and community builder'),
  (gen_random_uuid(), 'David Kim', 'davidk', 'Quantitative analyst in crypto markets'),
  (gen_random_uuid(), 'Lisa Wong', 'lisaw', 'AI researcher interested in trading bots');