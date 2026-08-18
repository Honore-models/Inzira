/**
 * Maps user emails to their profile photos.
 * This is a simple lookup — in production you'd store this in the DB.
 */
const photoMap: Record<string, string> = {
  "diane@youth.rw": "/diane.jpg",
  "jean@officer.rw": "/jeanclaude.jpg",
  "eric@youth.rw": "/emmanuel.jpg",
  // Additional seeded users
  "ange@youth.rw": "/ange.jpg",
  "divine@youth.rw": "/divine.jpg",
  "fablice@youth.rw": "/fablice.jpg",
  "gloria@youth.rw": "/gloria.jpg",
  "josiane@youth.rw": "/josiane.jpg",
  "sandrine@youth.rw": "/sandrine.jpg",
};

export function getPhotoUrl(email: string | null | undefined): string | null {
  if (!email) return null;
  return photoMap[email] || null;
}

/**
 * Maps institution initials to their logo images.
 */
const logoMap: Record<string, string> = {
  RDB: "/RDB_logo.png",
  RTB: "/RTB_logo.jpg",
  BDF: "/BDF_logo.png",
  RRA: "/RRA_logo.png",
};

export function getOrgLogo(initials: string): string | null {
  return logoMap[initials] || null;
}
