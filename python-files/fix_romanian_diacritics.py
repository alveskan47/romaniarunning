import json
import re
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Dictionary of common Romanian words and their correct forms with diacritics
DIACRITIC_CORRECTIONS = {
    # Cities and counties
    "Brasov": "Brașov",
    "Bucuresti": "București",
    "Timisoara": "Timișoara",
    "Constanta": "Constanța",
    "Iasi": "Iași",
    "Targu": "Târgu",
    "Tirgu": "Târgu",
    "Ploiesti": "Ploiești",
    "Pitesti": "Pitești",
    "Buzau": "Buzău",
    "Galati": "Galați",
    "Bacau": "Bacău",
    "Suceava": "Suceava",
    "Resita": "Reșița",
    "Drobeta-Turnu Severin": "Drobeta-Turnu Severin",
    "Calarasi": "Călărași",
    "Slatina": "Slatina",
    "Botosani": "Botoșani",
    "Ramnicu": "Râmnicu",
    "Tarnaveni": "Târnăveni",
    "Bistrita": "Bistrița",
    "Medias": "Mediaș",
    "Ludus": "Luduș",
    "Sighisoara": "Sighișoara",
    "Fagaras": "Făgăraș",
    "Campulung": "Câmpulung",
    "Curtea de Arges": "Curtea de Argeș",
    "Covasna": "Covasna",
    "Sfantu": "Sfântu",
    "Sangeorz": "Sângeorz",
    "Baia": "Baia",
    "Toplita": "Toplița",
    "Sacele": "Săcele",
    "Fagarasului": "Făgărașului",
    "Rasnov": "Râșnov",
    "Intorsura": "Întorsura",
    "Buzaului": "Buzăului",
    "Campina": "Câmpina",
    "Sinaia": "Sinaia",
    "Valenii": "Vălenii",
    "Muntii": "Munții",
    "Apuseni": "Apuseni",
    "Retezat": "Retezat",
    "Ceahlau": "Ceahlău",
    "Ciucas": "Ciucaș",
    "Piatra": "Piatra",
    "Neamt": "Neamț",
    "Pascani": "Pașcani",
    "Vaslui": "Vaslui",
    "Focsani": "Focșani",
    "Vrancea": "Vrancea",
    "Tecuci": "Tecuci",
    "Salonta": "Salonta",
    "Orastie": "Orăștie",
    "Hunedoara": "Hunedoara",
    "Petrosani": "Petroșani",
    "Deva": "Deva",
    "Lupeni": "Lupeni",
    "Vulcan": "Vulcan",
    "Caransebes": "Caransebeș",
    "Timisului": "Timișului",
    "Lugoj": "Lugoj",
    "Sannicolau": "Sânnicolau",
    "Arad": "Arad",
    "Lipova": "Lipova",
    "Chisineu": "Chișineu",
    "Cris": "Criș",
    "Ineu": "Ineu",
    "Pancota": "Pâncota",
    "Nadlac": "Nădlac",
    "Turnu": "Turnu",
    "Magurele": "Măgurele",
    "Giurgiu": "Giurgiu",
    "Oltenita": "Oltenița",
    "Slobozia": "Slobozia",
    "Fetesti": "Fetești",
    "Tandarei": "Țăndărei",
    "Urziceni": "Urziceni",
    "Lehliu": "Lehliu",
    "Mangalia": "Mangalia",
    "Medgidia": "Medgidia",
    "Navodari": "Năvodari",
    "Cernavoda": "Cernavodă",
    "Tulcea": "Tulcea",
    "Babadag": "Babadag",
    "Macin": "Măcin",
    "Isaccea": "Isaccea",
    "Sulina": "Sulina",
    "Braila": "Brăila",
    "Insuratei": "Însurăței",
    "Ianca": "Ianca",
    "Faurei": "Faurei",
    "Zimnicea": "Zimnicea",
    "Videle": "Videle",
    "Rosiori": "Roșiori",
    "Alexandria": "Alexandria",
    "Turnu Magurele": "Turnu Măgurele",
    "Craiova": "Craiova",
    "Bailesti": "Băilești",
    "Calafat": "Calafat",
    "Filiasi": "Filiași",
    "Segarcea": "Segarcea",
    "Targu Jiu": "Târgu Jiu",
    "Motru": "Motru",
    "Novaci": "Novaci",
    "Tismana": "Tismana",
    "Bumbesti": "Bumbești",
    "Jiu": "Jiu",
    "Caracal": "Caracal",
    "Corabia": "Corabia",
    "Balcesti": "Bălcești",
    "Scornicesti": "Scornicești",
    "Draganesti": "Drăgănești",
    "Comanesti": "Comănești",
    "Onesti": "Onești",
    "Moinesti": "Moinești",
    "Darmanesti": "Dărmănești",
    "Targu Ocna": "Târgu Ocna",
    "Slanic": "Slănic",
    "Moldova": "Moldova",
    "Roman": "Roman",
    "Piatra Neamt": "Piatra Neamț",
    "Bicaz": "Bicaz",
    "Targu Neamt": "Târgu Neamț",
    "Borsec": "Borsec",
    "Miercurea": "Miercurea",
    "Ciuc": "Ciuc",
    "Gheorgheni": "Gheorgheni",
    "Odorheiu": "Odorheiu",
    "Secuiesc": "Secuiesc",
    "Cristuru": "Cristuru",
    "Mures": "Mureș",
    "Reghin": "Reghin",
    "Sighetu": "Sighetu",
    "Marmatiei": "Marmației",
    "Viseul": "Vișeul",
    "Sapanta": "Săpânța",
    "Baia Mare": "Baia Mare",
    "Satu Mare": "Satu Mare",
    "Carei": "Carei",
    "Negresti": "Negrești",
    "Oas": "Oaș",
    "Zalau": "Zalău",
    "Simleu": "Șimleu",
    "Silvaniei": "Silvaniei",
    "Jibou": "Jibou",
    "Cluj-Napoca": "Cluj-Napoca",
    "Cluj": "Cluj",
    "Turda": "Turda",
    "Campia": "Câmpia",
    "Turzii": "Turzii",
    "Gherla": "Gherla",
    "Huedin": "Huedin",
    "Dej": "Dej",
    "Oradea": "Oradea",
    "Salonta": "Salonta",
    "Beius": "Beiuș",
    "Marghita": "Marghita",
    "Alesd": "Aleșd",
    "Alba Iulia": "Alba Iulia",
    "Alba": "Alba",
    "Sebes": "Sebeș",
    "Aiud": "Aiud",
    "Cugir": "Cugir",
    "Blaj": "Blaj",
    "Ocna": "Ocna",
    "Muresului": "Mureșului",
    "Sibiu": "Sibiu",
    "Cisnadie": "Cisnădie",
    "Talmaciu": "Tălmaciu",
    "Avrig": "Avrig",
    "Agnita": "Agnita",
    "Copsa": "Copșa",
    "Mica": "Mică",

    # Common words
    "Semimaraton": "Semimaraton",
    "Maraton": "Maraton",
    "Ultramaraton": "Ultramaraton",
    "Dealul": "Dealul",
    "Dealurile": "Dealurile",
    "Vaile": "Văile",
    "Padurile": "Pădurile",
    "Padurea": "Pădurea",
    "Cascada": "Cascada",
    "Muntele": "Muntele",
    "Varful": "Vârful",
    "Pestera": "Peștera",
    "Cheile": "Cheile",
    "Defileul": "Defileul",
    "Lacul": "Lacul",
    "Raul": "Râul",
    "Dunarii": "Dunării",
    "Dunarea": "Dunărea",
    "Ariesului": "Arieșului",
    "Arieseni": "Arieșeni",
    "Somes": "Someș",
    "Somesului": "Someșului",
    "Olt": "Olt",
    "Oltului": "Oltului",
    "Prut": "Prut",
    "Siret": "Siret",
    "Siretului": "Siretului",
    "Mures": "Mureș",
    "Jiului": "Jiului",
    "Arges": "Argeș",
    "Argesului": "Argeșului",
    "Prahova": "Prahova",
    "Prahovei": "Prahovei",
    "Dambovita": "Dâmbovița",
    "Dambovitei": "Dâmboviței",
    "Ialomita": "Ialomița",
    "Ialomitei": "Ialomiței",

    # Additional locations and words
    "Baneasa": "Băneasa",
    "Baicoi": "Băicoi",
    "Branesti": "Brănești",
    "Bals": "Bălș",
    "Calimanesti": "Călimănești",
    "Vatra Dornei": "Vatra Dornei",
    "Ramnicu Valcea": "Râmnicu Vâlcea",
    "Valcea": "Vâlcea",
    "Drobeta": "Drobeta",
    "Severin": "Severin",
    "Caracal": "Caracal",
    "Baragan": "Bărăgan",
    "Baraolt": "Baraolt",
    "Comarnic": "Comarnic",
    "Sinaia": "Sinaia",
    "Azuga": "Azuga",
    "Predeal": "Predeal",
    "Maneciu": "Maneciu",
    "Valeni": "Văleni",
    "Stefanesti": "Ștefănești",
    "Corbeanca": "Corbeanca",
    "Voluntari": "Voluntari",
    "Pantelimon": "Pantelimon",
    "Popesti": "Popești",
    "Leordeni": "Leordeni",
    "Chiajna": "Chiajna",
    "Bragadiru": "Bragadiru",
    "Jilava": "Jilava",
    "Domnesti": "Domnești",
    "Clinceni": "Clinceni",
    "Maramures": "Maramureș",
    "Harghita": "Harghita",
    "Salaj": "Sălaj",
    "Mehedinti": "Mehedinți",
    "Teleorman": "Teleorman",
    "Calarasi": "Călărași",
}

def fix_text_with_diacritics(text):
    """
    Replace words without diacritics with their correct forms.
    Uses word boundary matching to avoid partial replacements.
    """
    if not text or not isinstance(text, str):
        return text

    fixed_text = text
    changes_made = []

    for wrong, correct in DIACRITIC_CORRECTIONS.items():
        # Use word boundaries to match whole words
        pattern = r'\b' + re.escape(wrong) + r'\b'
        if re.search(pattern, fixed_text):
            fixed_text = re.sub(pattern, correct, fixed_text)
            if wrong != correct:
                changes_made.append(f"{wrong} -> {correct}")

    return fixed_text, changes_made

def fix_json_diacritics():
    """Fix Romanian diacritics in the JSON file"""
    json_file = "D:\\47x05\\romaniarunning\\json-files\\input-all-competitions.json"

    print("Loading JSON file...")
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    total_changes = 0
    change_log = []

    # Process both competitions and competitions_no_statistics
    for list_name in ["competitions", "competitions_no_statistics"]:
        if list_name not in data:
            continue

        competitions = data[list_name]
        print(f"\nProcessing {list_name}...")
        print(f"Found {len(competitions)} competitions")

        for idx, competition in enumerate(competitions):
            comp_name = competition.get("name", "Unknown")
            comp_id = competition.get("id", "?")
            comp_changes = []

            # Fix 'name' property
            if "name" in competition:
                fixed_name, changes = fix_text_with_diacritics(competition["name"])
                if changes:
                    competition["name"] = fixed_name
                    comp_changes.extend([f"name: {c}" for c in changes])

            # Fix 'location' property
            if "location" in competition:
                fixed_location, changes = fix_text_with_diacritics(competition["location"])
                if changes:
                    competition["location"] = fixed_location
                    comp_changes.extend([f"location: {c}" for c in changes])

            # Fix 'location_details' property
            if "location_details" in competition:
                fixed_details, changes = fix_text_with_diacritics(competition["location_details"])
                if changes:
                    competition["location_details"] = fixed_details
                    comp_changes.extend([f"location_details: {c}" for c in changes])

            # Log changes for this competition
            if comp_changes:
                log_entry = f"{list_name}[{idx}] '{comp_name}' (id={comp_id}):"
                for change in comp_changes:
                    log_entry += f"\n  - {change}"
                change_log.append(log_entry)
                total_changes += len(comp_changes)

    # Display changes
    print(f"\n{'='*80}")
    print(f"TOTAL CHANGES: {total_changes}")
    print(f"{'='*80}\n")

    if change_log:
        print("Changes made:\n")
        for log_entry in change_log:
            print(log_entry)
            print()
    else:
        print("No changes needed - all diacritics are correct!")

    # Save the fixed JSON file
    if total_changes > 0:
        print(f"\n{'='*80}")
        print("Saving fixed JSON file...")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("Done! File saved successfully.")

    return total_changes

if __name__ == "__main__":
    changes = fix_json_diacritics()
    if changes > 0:
        print(f"\n✓ Fixed {changes} diacritic issue(s)")
    else:
        print("\n✓ No issues found")