/*
 * Placeholder photography from Unsplash (free under the Unsplash License, no
 * attribution required). Replace with real photos of our own tradespeople
 * before launch: put them in /public or Supabase Storage and change the URLs
 * here. Nothing else needs to change.
 */

// Width and quality are added per screen size by src/lib/image-loader.ts.
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const photos = {
  hero: unsplash("1749532125405-70950966b0e5"),
  about: unsplash("1758686254563-5c5ab338c8b9"),
  whyChoose: unsplash("1621905251189-08b45d6a269e"),
  cta: unsplash("1782970795057-b219e667ad00"),

  plumbing: unsplash("1676210134188-4c05dd172f89"),
  electrical: unsplash("1758101755915-462eddc23f57"),
  heating: unsplash("1599028274511-e02a767949a3"),
  handyman: unsplash("1562259929-b4e1fd3aef09"),
  gas: unsplash("1767771665869-51fab4d8c83b"),
  painting: unsplash("1652829069834-2c05031199c5"),
  carpentry: unsplash("1659930087003-2d64e33181f7"),

  jobSink: unsplash("1609210884848-2d530cfb2a07"),
  jobFuseBox: unsplash("1544724569-5f546fd6f2b5"),
  jobHeating: unsplash("1518276779712-dfdcb9daa7a1"),
  jobTv: unsplash("1586024486164-ce9b3d87e09f"),

  reviewCustomer: unsplash("1758874960868-eebf9d36d5d5"),
  reviewPhone: unsplash("1758598497259-b51e6ed6c73c"),

  guideRadiator: unsplash("1669725341213-7379ff6c90d5"),
  guideGas: unsplash("1761758674188-2b8e4c89c5e2"),
  guideStopcock: unsplash("1759091563266-b1ce4d8b484d"),
} as const;
