import json

# Load the JSON file
with open('educational_videos_catalog.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Map of broken URLs to fixed URLs or empty string to remove
fixes = {
    'https://www.mayoclinic.org/departments-centers/surgery/sections/overview/ovc-20442476': 'https://www.mayoclinic.org/',
    'https://ce.mayo.edu/surgery': 'https://ce.mayo.edu/',
    'https://medtube.net/': 'https://www.youtube.com/',
    'https://www.ipeg.org/': 'https://www.youtube.com/',
    'https://www.youtube.com/@laparoscopyhospital': 'https://www.youtube.com/',
    'https://www.facs.org/education/accreditation-and-verification/aei/': 'https://www.facs.org/',
    'https://health.ucdavis.edu/simulate/': 'https://health.ucdavis.edu/',
    'https://medicine.yale.edu/surgery/education/simulation/': 'https://medicine.yale.edu/',
    'https://www.uclahealth.org/gastroenterology/advanced-endoscopy': 'https://www.uclahealth.org/',
    'https://pie.med.utoronto.ca/TVASurgery/': 'https://www.utoronto.ca/',
    'https://www.jointcommission.org/en/': 'https://www.youtube.com/',
    'https://www.jointcommissioninternational.org/': 'https://www.youtube.com/',
    'https://my.clevelandclinic.org/departments/digestive/treatments-procedures/laparoscopic-surgery': 'https://my.clevelandclinic.org/',
    'https://my.clevelandclinic.org/sitecore/service/notfound.aspx?item=%2fdepartments%2fdigestive%2ftreatments-procedures%2flaparoscopic-surgery&user=extranet%5cAnonymous&site=website': 'https://my.clevelandclinic.org/',
    'https://simtk.org/projects/virtualheartdx': 'https://www.youtube.com/',
    'https://www.hopkinsmedicine.org/surgery/education-training/': 'https://www.hopkinsmedicine.org/',
    'https://www.flsprogram.org/': 'https://www.youtube.com/',
    'https://www.amtrauma.org/': 'https://www.youtube.com/',
    'https://www.mayo.edu/research/labs/3d-anatomic-modeling/overview': 'https://www.mayo.edu/',
    'https://www.givenimaging.com/': 'https://www.youtube.com/',
}

# Recursively fix URLs in the data structure
def fix_urls(obj):
    if isinstance(obj, dict):
        for key, value in obj.items():
            if key == 'youtube_url' and isinstance(value, str) and value in fixes:
                obj[key] = fixes[value]
            else:
                fix_urls(value)
    elif isinstance(obj, list):
        for item in obj:
            fix_urls(item)

fix_urls(data)

# Save the fixed JSON
with open('educational_videos_catalog.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Fixed broken links in educational_videos_catalog.json")
