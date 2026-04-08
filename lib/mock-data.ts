import type { EbayItem } from '../types/ebay'

function validateUrl(url: string): boolean {
  if (!url) return true // Empty URLs are allowed (will show placeholder)
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function validateMockItem(item: EbayItem): void {
  if (!validateUrl(item.imageUrl)) {
    throw new Error(`Invalid imageUrl in mock data: ${item.imageUrl}`)
  }
  if (!validateUrl(item.itemWebUrl)) {
    throw new Error(`Invalid itemWebUrl in mock data: ${item.itemWebUrl}`)
  }
}

export const mockItems: EbayItem[] = [
  {
    id: 'v1|305313150439|0',
    title: 'Apple iPhone 15 Pro 256GB Natural Titanium - Unlocked - Excellent Condition',
    price: '899.99',
    currency: 'USD',
    condition: 'Used',
    imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-natural-titanium-select-2023?wid=470&hei=556&fmt=jpeg&qlt=95&.v=1692846205040',
    itemWebUrl: 'https://www.ebay.com/itm/305313150439',
  },
  {
    id: 'v1|326984071559|0',
    title: 'Apple MacBook Pro 14-inch M3 18GB RAM 512GB SSD Space Black - Open Box',
    price: '1499.00',
    currency: 'USD',
    condition: 'Refurbished',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81h0GFQG8QL._AC_SL1500_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/326984071559',
  },
  {
    id: 'v1|236741152485|0',
    title: 'Apple AirPods Pro 2nd Gen with MagSafe Charging Case USB-C - Sealed',
    price: '184.95',
    currency: 'USD',
    condition: 'New',
    imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MME73_FV119?wid=470&hei=556&fmt=jpeg&qlt=95&.v=1691868455666',
    itemWebUrl: 'https://www.ebay.com/itm/236741152485',
  },
  {
    id: 'v1|326938737504|0',
    title: 'Sony PlayStation 5 Disc Console 1TB + DualSense Controller Bundle',
    price: '469.99',
    currency: 'USD',
    condition: 'New',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/511tTn56YwL._AC_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/326938737504',
  },
  {
    id: 'v1|116888998011|0',
    title: 'Samsung 55" QLED 4K Smart TV QN55Q80C - Remote Included - Works Great',
    price: '529.50',
    currency: 'USD',
    condition: 'Used',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81-DTmlnB0L._AC_SL1500_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/116888998011',
  },
  {
    id: 'v1|336520519347|0',
    title: 'Nike Air Jordan 1 Retro High OG Men\'s Sneakers Size 10 Black/White',
    price: '214.00',
    currency: 'USD',
    condition: 'Used',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71x5xsT1MZL._AC_UY695_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/336520519347',
  },
  {
    id: 'v1|389855859221|0',
    title: 'Levi\'s 501 Original Fit Jeans Men 34x32 Dark Wash Denim Classic',
    price: '39.99',
    currency: 'USD',
    condition: 'New',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71o3RZy-8OL._AC_UY679_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/389855859221',
  },
  {
    id: 'v1|157680130162|0',
    title: 'Adidas Essentials Fleece Pullover Hoodie Men Large Gray Trefoil Logo',
    price: '34.50',
    currency: 'USD',
    condition: 'Used',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71w7W9V3PML._AC_UY679_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/157680130162',
  },
  {
    id: 'v1|267621308303|0',
    title: 'Keurig K-Supreme Single Serve Coffee Maker Black - Tested Working',
    price: '79.95',
    currency: 'USD',
    condition: 'Refurbished',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81Ot8yJZ4hL._AC_SL1500_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/267621308303',
  },
  {
    id: 'v1|276014546170|0',
    title: 'Dyson V11 Torque Drive Cordless Vacuum Cleaner Purple - Battery Included',
    price: '299.99',
    currency: 'USD',
    condition: 'Used',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71-tUBUY76L._AC_SL1500_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/276014546170',
  },
  {
    id: 'v1|127762539561|0',
    title: 'LEGO Star Wars Millennium Falcon 75257 Complete Set with Manual',
    price: '126.00',
    currency: 'USD',
    condition: 'Used',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81yOjU7eZxL._AC_SL1500_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/127762539561',
  },
  {
    id: 'v1|397754457240|0',
    title: 'Premium Non-Slip Yoga Mat 6mm Extra Thick with Carry Strap Purple',
    price: '24.99',
    currency: 'USD',
    condition: 'New',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81x2P2c5JQL._AC_SL1500_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/397754457240',
  },
  {
    id: 'v1|286160712293|0',
    title: 'Adjustable Dumbbell Set 25LB Pair with Connector Bar for Home Gym',
    price: '109.00',
    currency: 'USD',
    condition: 'New',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/91JJrU4pmML._AC_SL1500_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/286160712293',
  },
  {
    id: 'v1|298045889726|0',
    title: 'Wilson Pro Staff Tennis Racket Grip 4 3/8 - Adult Performance Racquet',
    price: '89.95',
    currency: 'USD',
    condition: 'Used',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/61S8gqGr8oL._AC_SL1500_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/298045889726',
  },
  {
    id: 'v1|168272175566|0',
    title: 'Pokemon Charizard Holo Card PSA 8 Base Set 1999 - Authentic Slab',
    price: '749.00',
    currency: 'USD',
    condition: 'Used',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71VNtZRBqBL._AC_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/168272175566',
  },
  {
    id: 'v1|306866802449|0',
    title: 'Vintage Seiko Automatic Watch 7009-876A Day Date 37mm Runs Great',
    price: '189.50',
    currency: 'USD',
    condition: 'Used',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71VJR4i4TbL._AC_SL1500_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/306866802449',
  },
  {
    id: 'v1|406510951095|0',
    title: '1989 Upper Deck Ken Griffey Jr Rookie Baseball Card #1 - Sharp Corners',
    price: '125.00',
    currency: 'USD',
    condition: 'Refurbished',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/91lD1oCYs4L._AC_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/406510951095',
  },
  {
    id: 'v1|236732284064|0',
    title: 'Nintendo Switch OLED Model Neon Red/Blue Joy-Con Console Complete',
    price: '269.99',
    currency: 'USD',
    condition: 'Used',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/61-EFYCJb3L._AC_SL1500_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/236732284064',
  },
  {
    id: 'v1|117006580306|0',
    title: 'Microsoft Xbox Wireless Controller Carbon Black for Series X|S and PC',
    price: '44.99',
    currency: 'USD',
    condition: 'New',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71wSEKRTgdL._AC_SL1500_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/117006580306',
  },
  {
    id: 'v1|227235304488|0',
    title: 'Valve Steam Deck 512GB NVMe Handheld Gaming Console - For Parts Repair',
    price: '289.99',
    currency: 'USD',
    condition: 'For parts or not working',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/41Fg9TznRcL._AC_.jpg',
    itemWebUrl: 'https://www.ebay.com/itm/227235304488',
  },
].map((item) => {
  validateMockItem(item)
  return item
})
