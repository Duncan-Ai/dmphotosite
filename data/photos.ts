// ============================================================================
//  YOUR PHOTOS LIVE HERE
// ----------------------------------------------------------------------------
//  This is the only file you need to touch to add, remove, or edit a photo.
//
//  To add a real photo:
//    1. Drop the image file into  /public/images  (e.g. heron.jpg)
//    2. Copy one of the blocks below and change the fields.
//    3. Set  "image"  to  "/images/heron.jpg"
//
//  Fields:
//    slug      -> the web address for the photo's story page (letters + dashes)
//    title     -> the little headline shown on the photo
//    location  -> where in Florida you shot it (shown under the title)
//    teaser    -> one line that shows on the home page under the title
//    story     -> the full story. Each string is its own paragraph.
//    image     -> path to the photo, starting with /images/
//    sold      -> true once the one print sells. Leave false while available.
//    price     -> optional. A number like 450, or leave it out to say "Inquire".
// ============================================================================

export type Photo = {
  slug: string;
  title: string;
  location: string;
  teaser: string;
  story: string[];
  image: string;
  sold: boolean;
  price?: number;
  // Physical print details — shown on the photo page only when filled in
  // (i.e. when you actually have that print made/in stock):
  size?: string;
  material?: string;
  // Optional photo of the actual physical print (framed / on a wall / in hand):
  printImage?: string;
  // Set for photos added through the /admin page (not the seed placeholders):
  id?: string;
  createdAt?: number;
};

export const photos: Photo[] = [
  {
    slug: "morning-on-the-marsh",
    title: "Morning on the Marsh",
    location: "Green Cay Wetlands, Boynton Beach",
    teaser: "The fog burned off about ten minutes after I got here.",
    story: [
      "I almost stayed in bed for this one. Alarm went off at 5:15, it was cold for Florida, and I sat in the truck for a while talking myself into it.",
      "By the time I got out to the boardwalk the whole marsh was under a low fog, and the sun came up right behind it. For about ten minutes everything glowed. Then it burned off like it was never there.",
      "That's the thing about mornings out here — you either show up for them or you don't. This is the one frame where the light and the fog lined up. I've never gotten it again.",
    ],
    image: "/images/morning-on-the-marsh.svg",
    sold: false,
  },
  {
    slug: "the-old-heron",
    title: "The Old Heron",
    location: "Wakodahatchee Wetlands, Delray Beach",
    teaser: "Same bird, same corner, every single morning.",
    story: [
      "There's a great blue heron that works the same corner of this boardwalk every morning. The regulars all know him. He's not bothered by people at all — he's got a spot and he's sticking to it.",
      "I watched him for about an hour waiting for him to do something interesting. He mostly just stood there. Then he stretched his neck out to catch the light and I got it.",
      "I like this one because it doesn't feel like a nature magazine. It feels like a guy who's been doing the same job for twenty years and is good at it.",
    ],
    image: "/images/the-old-heron.svg",
    sold: false,
  },
  {
    slug: "gulf-storm-rolling-in",
    title: "Gulf Storm Rolling In",
    location: "Sanibel Island",
    teaser: "Everybody else was packing up. I stayed.",
    story: [
      "Afternoon storms on the Gulf coast come in fast. One minute it's a normal beach day, the next there's a wall of gray coming at you off the water.",
      "Everybody on the beach started packing up their chairs and coolers. I figured I had a couple minutes, so I stayed and shot the front edge of it rolling in over the flat water.",
      "Got soaked about ninety seconds after this. Worth it.",
    ],
    image: "/images/gulf-storm-rolling-in.svg",
    sold: false,
  },
  {
    slug: "cypress-reflections",
    title: "Cypress Reflections",
    location: "Big Cypress National Preserve",
    teaser: "Dead still water, which almost never happens out here.",
    story: [
      "You need dead still water for a reflection like this, and out in the cypress that almost never happens — there's usually a breeze or a gator or a bird moving through.",
      "This particular slough went glass-calm right around golden hour. The trees doubled up perfectly in the water and the whole thing turned gold.",
      "I sat on a log and waited for the surface to settle between gusts. This is the frame where nothing moved.",
    ],
    image: "/images/cypress-reflections.svg",
    sold: false,
  },
  {
    slug: "spoonbill-pink",
    title: "Spoonbill Pink",
    location: "Merritt Island National Wildlife Refuge",
    teaser: "People think I edited the color. I didn't.",
    story: [
      "Roseate spoonbills are the birds people can't believe are real. That pink is not something I added in — that's just what they look like when the light hits them right.",
      "This group was feeding in the shallows at Merritt Island, sweeping those spoon-shaped bills side to side through the water. I got low and shot along the surface so the color would really carry.",
      "If you've never seen one in person, put it on your list. Photos don't quite do it.",
    ],
    image: "/images/spoonbill-pink.svg",
    sold: false,
  },
  {
    slug: "sea-oats-at-dusk",
    title: "Sea Oats at Dusk",
    location: "Amelia Island",
    teaser: "The dune grass held the last bit of light.",
    story: [
      "Up on the northeast coast the dunes are covered in sea oats, and in the evening they catch the wind and the last of the light at the same time.",
      "I walked the beach until the sky went purple and orange behind them. Didn't want any people or footprints in the frame, so I kept moving until I found a clean stretch of dune.",
      "This is the quiet end of a Florida day. No crowds, no noise, just the grass moving.",
    ],
    image: "/images/sea-oats-at-dusk.svg",
    sold: false,
  },
  {
    slug: "backwater-gator",
    title: "Backwater Gator",
    location: "Everglades National Park",
    teaser: "He knew exactly where I was the whole time.",
    story: [
      "Let me be clear: I used a long lens and I kept my distance. You don't get cute with these.",
      "He was sitting in the duckweed with just his eyes and back showing, completely still, doing that thing they do where they look like a log until they don't. He knew exactly where I was the entire time.",
      "I love how the green weed sits on top of the dark water here. It's the Everglades in one frame — still, green, and paying attention.",
    ],
    image: "/images/backwater-gator.svg",
    sold: false,
  },
  {
    slug: "low-tide-sanibel",
    title: "Low Tide",
    location: "Sanibel Island",
    teaser: "The whole beach turned into a mirror.",
    story: [
      "When the tide goes way out on Sanibel it leaves this thin sheet of water on the sand, and the whole beach turns into a mirror of the sky.",
      "I went out barefoot with my pants rolled up and just watched the pastel colors sit on the wet sand. Every few seconds a little wave would come in and reset the whole thing.",
      "Sanibel's famous for shells, but this is the version of it I keep coming back for.",
    ],
    image: "/images/low-tide-sanibel.svg",
    sold: false,
  },
];

export function getPhoto(slug: string): Photo | undefined {
  return photos.find((p) => p.slug === slug);
}
