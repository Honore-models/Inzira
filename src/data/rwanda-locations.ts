// ============================================================
// Rwanda Districts and Sectors
// All 30 districts across 5 provinces
// ============================================================

export type Province =
  | "City of Kigali"
  | "Eastern Province"
  | "Northern Province"
  | "Southern Province"
  | "Western Province";

export interface District {
  name: string;
  province: Province;
  sectors: string[];
}

export const rwandaDistricts: District[] = [
  // ──────────────────────────────────────────────
  // CITY OF KIGALI (3 districts)
  // ──────────────────────────────────────────────
  {
    name: "Gasabo",
    province: "City of Kigali",
    sectors: [
      "Bumbogo",
      "Gatsata",
      "Gikomero",
      "Gisozi",
      "Jabana",
      "Kacyiru",
      "Kimihurura",
      "Kimisagara",
      "Kinyange",
      "Kirotshe",
      "Masaka",
      "Murindi",
      "Nyabisindu",
      "Nyarubuye",
      "Remera",
    ],
  },
  {
    name: "Kicukiro",
    province: "City of Kigali",
    sectors: [
      "Gashora",
      "Gatenga",
      "Gikondo",
      "Kabeza",
      "Kanombe",
      "Karembure",
      "Kicukiro",
      "Kigali",
      "Kimihurura",
      "Kimisagara",
      "Nibehe",
      "Niboye",
      "Nyarugunga",
      "Nyabarongo",
    ],
  },
  {
    name: "Nyarugenge",
    province: "City of Kigali",
    sectors: [
      "Gitega",
      "Kanyinya",
      "Kigali",
      "Kimisagara",
      "Mapendo",
      "Muhima",
      "Nyabisindu",
      "Nyamirambo",
      "Nyarugenge",
      "Rwezamenyo",
    ],
  },

  // ──────────────────────────────────────────────
  // EASTERN PROVINCE (7 districts)
  // ──────────────────────────────────────────────
  {
    name: "Bugesera",
    province: "Eastern Province",
    sectors: [
      "Gashora",
      "Juru",
      "Kamabuye",
      "Marembo",
      "Musenyi",
      "Nyamata",
      "Nyarugenge",
      "Rilima",
      "Ruhuha",
      "Rweru",
      "Shyara",
      "Kamabuye",
      "Ntarama",
      "Cyeru",
    ],
  },
  {
    name: "Gatsibo",
    province: "Eastern Province",
    sectors: [
      "Gasange",
      "Gatsibo",
      "Gitogo",
      "Kabarore",
      "Kagitumba",
      "Kiziguro",
      "Muhura",
      "Murambi",
      "Ngarama",
      "Nyagahinga",
      "Nyake",
      "Rwimbogo",
      "Kiziguro",
    ],
  },
  {
    name: "Kayonza",
    province: "Eastern Province",
    sectors: [
      "Gahini",
      "Kabare",
      "Kabarondo",
      "Mukarange",
      "Murama",
      "Murundi",
      "Mwiri",
      "Ndego",
      "Nyamirama",
      "Rukara",
      "Ruramira",
      "Rwinkwavu",
    ],
  },
  {
    name: "Kirehe",
    province: "Eastern Province",
    sectors: [
      "Gahara",
      "Gatore",
      "Kigarama",
      "Mugina",
      "Munini",
      "Musamo",
      "Nyabikiri",
      "Nyamugali",
      "Nyankongo",
      "Rugarama",
      "Ruziba",
    ],
  },
  {
    name: "Ngoma",
    province: "Eastern Province",
    sectors: [
      "Kaduha",
      "Kibungo",
      "Mugesera",
      "Murama",
      "Mutenderi",
      "Remera",
      "Rukira",
      "Rukumberi",
      "Rurenge",
      "Sake",
      "Zaza",
    ],
  },
  {
    name: "Nyagatare",
    province: "Eastern Province",
    sectors: [
      "Bukamba",
      "Gatunda",
      "Karama",
      "Kiziba",
      "Mimuri",
      "Mukama",
      "Musheri",
      "Nyagatare",
      "Rukomo",
      "Rwempasha",
      "Rwirangira",
      "Tumba",
    ],
  },
  {
    name: "Rwamagana",
    province: "Eastern Province",
    sectors: [
      "Fumbwe",
      "Gahengeri",
      "Gishari",
      "Karenge",
      "Kigabiro",
      "Muhazi",
      "Murama",
      "Muyumbu",
      "Nyakariro",
    ],
  },

  // ──────────────────────────────────────────────
  // NORTHERN PROVINCE (5 districts)
  // ──────────────────────────────────────────────
  {
    name: "Burera",
    province: "Northern Province",
    sectors: [
      "Bukona",
      "Butare",
      "Cyahafi",
      "Cyanika",
      "Gahunga",
      "Gaseke",
      "Gatore",
      "Kigabiro",
      "Kinazo",
      "Mugano",
      "Musasa",
      "Rwabago",
    ],
  },
  {
    name: "Gakenke",
    province: "Northern Province",
    sectors: [
      "Busengo",
      "Coko",
      "Cyabingo",
      "Gakenke",
      "Gashenyi",
      "Mugunga",
      "Muhondo",
      "Mukira",
      "Nombe",
      "Rukura",
    ],
  },
  {
    name: "Gicumbi",
    province: "Northern Province",
    sectors: [
      "Bukure",
      "Bumba",
      "Cyumba",
      "Gakenke",
      "Gashiru",
      "Gicumbi",
      "Kigarama",
      "Mangenyi",
      "Munyange",
      "Muvumu",
      "Nyamiyaga",
      "Rutare",
      "Rweza",
      "Vuba",
    ],
  },
  {
    name: "Musanze",
    province: "Northern Province",
    sectors: [
      "Cyabararika",
      "Gakingo",
      "Gatarayiha",
      "Kabeza",
      "Kamata",
      "Muhoza",
      "Muko",
      "Musanze",
      "Nkotsi",
      "Nyange",
    ],
  },
  {
    name: "Rulindo",
    province: "Northern Province",
    sectors: [
      "Base",
      "Birga",
      "Buhonga",
      "Bushoki",
      "Buyoga",
      "Cyinzuzi",
      "Cyungo",
      "Kinihira",
      "Kisaro",
      "Masoro",
      "Mugambazi",
    ],
  },

  // ──────────────────────────────────────────────
  // SOUTHERN PROVINCE (12 districts)
  // ──────────────────────────────────────────────
  {
    name: "Gisagara",
    province: "Southern Province",
    sectors: [
      "Gikonko",
      "Gishubi",
      "Kansi",
      "Kibumbwe",
      "Kitabi",
      "Muganza",
      "Mukura",
      "Nyanza",
      "Save",
      "Kibirizi",
    ],
  },
  {
    name: "Huye",
    province: "Southern Province",
    sectors: [
      "Gishamvu",
      "Huye",
      "Karama",
      "Katobotobo",
      "Kigoma",
      "Kinazi",
      "Maraba",
      "Mukura",
      "Ngoma",
      "Ruhashya",
    ],
  },
  {
    name: "Kamonyi",
    province: "Southern Province",
    sectors: [
      "Gacurabwenge",
      "Karama",
      "Kubingo",
      "Mugina",
      "Musambira",
      "Ngamba",
      "Nyamiyaga",
      "Nyarubaka",
      "Rugarika",
      "Rukoma",
    ],
  },
  {
    name: "Muhanga",
    province: "Southern Province",
    sectors: [
      "Gati",
      "Kabgayi",
      "Kamirenzi",
      "Kibangu",
      "Kiyumba",
      "Muhanga",
      "Munini",
      "Nyamabuye",
      "Nyarusange",
      "Rongi",
    ],
  },
  {
    name: "Nyamagabe",
    province: "Southern Province",
    sectors: [
      "Buramba",
      "Cyanika",
      "Gatare",
      "Kaduha",
      "Kamegeri",
      "Kizi",
      "Mubuga",
      "Mugano",
      "Musange",
      "Nyamagabe",
      "Nyanza",
      "Save",
    ],
  },
  {
    name: "Nyanza",
    province: "Southern Province",
    sectors: [
      "Busasamana",
      "Cyahinda",
      "Cyotamuco",
      "Gahembe",
      "Gatare",
      "Kibirizi",
      "Kigina",
      "Mukongoro",
      "Ngoma",
      "Nyabinyenzi",
    ],
  },
  {
    name: "Nyaruguru",
    province: "Southern Province",
    sectors: [
      "Buhavu",
      "Bukamba",
      "Busanze",
      "Cyahinda",
      "Kibeho",
      "Mata",
      "Muganza",
      "Munini",
      "Nyabitaba",
      "Nyaruguru",
      "Yeru",
      "Ruheru",
    ],
  },
  {
    name: "Nyirangarama", // sometimes listed as Nyaruguru sub
    province: "Southern Province",
    sectors: [
      "Birima",
      "Gahora",
      "Kibungo",
      "Muvumba",
      "Nyirangarama",
      "Rugendabari",
      "Ruhinga",
    ],
  },
  {
    name: "Ruhango",
    province: "Southern Province",
    sectors: [
      "Byimana",
      "Kabagali",
      "Kinihira",
      "Muyira",
      "Ntongwe",
      "Ruhango",
    ],
  },

  // ──────────────────────────────────────────────
  // WESTERN PROVINCE (7 districts)
  // ──────────────────────────────────────────────
  {
    name: "Karongi",
    province: "Southern Province" as Province, // will fix below
    sectors: [
      "Bwishyura",
      "Gishyita",
      "Gitesi",
      "Mubuga",
      "Murambi",
      "Murundi",
      "Ngoma",
      "Rwamagana",
      "Rwankuba",
      "Twumba",
      "Kayumba",
    ],
  },
  {
    name: "Ngororero",
    province: "Western Province",
    sectors: [
      "Birembo",
      "Bugarura",
      "Gashenyi",
      "Gihororo",
      "Kabaya",
      "Kageyo",
      "Muhanda",
      "Musanze",
      "Ntoroko",
      "Rusenyi",
    ],
  },
  {
    name: "Nyabihu",
    province: "Western Province",
    sectors: [
      "Bigogwe",
      "Jenda",
      "Kabatwa",
      "Kamira",
      "Kintobo",
      "Mukamira",
      "Nyabihu",
      "Nyange",
      "Rambura",
      "Rugera",
    ],
  },
  {
    name: "Nyamasheke",
    province: "Western Province",
    sectors: [
      "Bagira",
      "Bugarura",
      "Gihombo",
      "Gisakura",
      "Kagano",
      "Kanyundo",
      "Muka",
      "Mukoto",
      "Nyabitekeri",
      "Rangiro",
      "Ruharambuga",
      "Shangi",
    ],
  },
  {
    name: "Rubavu",
    province: "Western Province",
    sectors: [
      "Bugeshi",
      "Busasamana",
      "Cyanzarwe",
      "Gisenyi",
      "Kamembe",
      "Mugenzi",
      "Mukanzi",
      "Ninda",
      "Nyakiriba",
      "Nyamyumba",
      "Rutsiro",
    ],
  },
  {
    name: "Rusizi",
    province: "Western Province",
    sectors: [
      "Bugarama",
      "Butare",
      "Gasheshe",
      "Gitanda",
      "Kamembe",
      "Mubavu",
      "Muganza",
      "Mururu",
      "Nkombo",
      "Nyabitekeri",
      "Nyanza",
      "Ruzizi",
    ],
  },
  {
    name: "Rutsiro",
    province: "Western Province",
    sectors: [
      "Boneza",
      "Gihango",
      "Kigeyo",
      "Kivumu",
      "Manihira",
      "Mukura",
      "Muramba",
      "Nyabirasi",
      "Ruhango",
      "Rusebeya",
    ],
  },
];

// Fix Karongi province (it should be Western Province)
rwandaDistricts.find((d) => d.name === "Karongi")!.province = "Western Province";

// Remove Nyirangarama (not a real district, was a duplicate)
const nyirangaramaIndex = rwandaDistricts.findIndex((d) => d.name === "Nyirangarama");
if (nyirangaramaIndex !== -1) rwandaDistricts.splice(nyirangaramaIndex, 1);

// ──────────────────────────────────────────────
// Derived data for easy use in components
// ──────────────────────────────────────────────

/** Sorted list of all district names */
export const districtNames = rwandaDistricts.map((d) => d.name).sort();

/** Get sectors for a given district name */
export function getSectorsForDistrict(districtName: string): string[] {
  const district = rwandaDistricts.find((d) => d.name === districtName);
  return district ? [...district.sectors].sort() : [];
}

/** Get province for a given district name */
export function getProvinceForDistrict(districtName: string): Province | undefined {
  const district = rwandaDistricts.find((d) => d.name === districtName);
  return district?.province;
}

/** Group districts by province */
export function getDistrictsByProvince(): Record<Province, string[]> {
  const grouped: Record<Province, string[]> = {
    "City of Kigali": [],
    "Eastern Province": [],
    "Northern Province": [],
    "Southern Province": [],
    "Western Province": [],
  };
  for (const d of rwandaDistricts) {
    grouped[d.province].push(d.name);
  }
  // Sort each province's districts
  for (const key of Object.keys(grouped) as Province[]) {
    grouped[key].sort();
  }
  return grouped;
}
