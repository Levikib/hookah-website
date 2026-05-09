-- Seed inventory table with all 36 flavours at 200 units per size.
-- Idempotent: re-running resets stock to 200 for each size.

INSERT INTO public.inventory (flavour_id, stock_50g, stock_100g, stock_250g) VALUES
  (1,  200, 200, 200),  -- Double Apple
  (2,  200, 200, 200),  -- Grape Royale
  (3,  200, 200, 200),  -- Shisha Classic
  (4,  200, 200, 200),  -- Two Kings
  (5,  200, 200, 200),  -- Dark Rose
  (6,  200, 200, 200),  -- Golden Era
  (7,  200, 200, 200),  -- Mint Glacier
  (8,  200, 200, 200),  -- Watermelon Chill
  (9,  200, 200, 200),  -- Lemon Mint
  (10, 200, 200, 200),  -- Kiwi Breeze
  (11, 200, 200, 200),  -- Arctic Blast
  (12, 200, 200, 200),  -- Cucumber Lime
  (13, 200, 200, 200),  -- Blueberry Burst
  (14, 200, 200, 200),  -- Peach Ice
  (15, 200, 200, 200),  -- Strawberry Dream
  (16, 200, 200, 200),  -- Cherry Bomb
  (17, 200, 200, 200),  -- Melon Mix
  (18, 200, 200, 200),  -- Orange Creamsicle
  (19, 200, 200, 200),  -- Mango Tango
  (20, 200, 200, 200),  -- Pineapple Punch
  (21, 200, 200, 200),  -- Coconut Coast
  (22, 200, 200, 200),  -- Passion Fruit
  (23, 200, 200, 200),  -- Tropical Storm
  (24, 200, 200, 200),  -- Papaya Sunrise
  (25, 200, 200, 200),  -- Rose Garden
  (26, 200, 200, 200),  -- Lavender Haze
  (27, 200, 200, 200),  -- Jasmine Pearl
  (28, 200, 200, 200),  -- Spiced Chai
  (29, 200, 200, 200),  -- Iced Cappuccino
  (30, 200, 200, 200),  -- Cardamom Dream
  (31, 200, 200, 200),  -- Cola Freeze
  (32, 200, 200, 200),  -- Bubblegum Pop
  (33, 200, 200, 200),  -- Cotton Candy
  (34, 200, 200, 200),  -- Blue Mist
  (35, 200, 200, 200),  -- Phantom
  (36, 200, 200, 200)   -- Midnight Blueberry
ON CONFLICT (flavour_id)
DO UPDATE SET
  stock_50g  = 200,
  stock_100g = 200,
  stock_250g = 200;
