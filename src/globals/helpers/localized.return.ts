export function localizedObject(
  obj: unknown,
  locale: 'en' | 'ar' | string,
  notLocalized?: string[],
) {
  const targetLanguage = locale?.toLowerCase() == 'ar' ? 'ar' : 'en';
  if (locale === 'admin') return obj;
  if (typeof obj !== 'object' || obj === null) {
    // Base case: if the input is not an object, or is null, return it as is

    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    return obj;
  }
  // Process each key in the object
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      let newKey = key;

      // Check if the key ends with "En" or "Ar" (case-sensitive)
      if (
        (targetLanguage === 'en' && key.endsWith('En')) ||
        (targetLanguage === 'ar' && key.endsWith('Ar'))
      ) {
        // Remove the suffix
        newKey = key.slice(0, -2);
      } else if (key.endsWith('En') || key.endsWith('Ar')) {
        // Remove keys with a different language suffix
        if (!notLocalized || !notLocalized.includes(key)) {
          delete obj[key as keyof typeof obj];
        }
        continue; // Skip further processing for this key
      }

      // Recursively process nested objects
      obj[newKey] = localizedObject(
        obj[key as keyof typeof obj],
        targetLanguage,
      );

      // Remove the old key if it was modified
      if (newKey !== key && (!notLocalized || !notLocalized.includes(key))) {
        delete obj[key as keyof typeof obj];
      }
    }
  }

  return obj;
}
