export const groupedBy = (
  products: any,
  key: string,
  base: any,
  locale: Locale,
) => {
  const result = [];
  const grouped = products.reduce((acc, product) => {
    const groupKey = product[key];
    if (!acc[groupKey]) {
      // result.push({
      //   id: groupKey,
      //   name: product[base]
      //     ? product[base][
      //         `name${locale.toLowerCase().at(0).toUpperCase() + locale.slice(1)}`
      //       ]
      //     : base[
      //         `name${locale.toLowerCase().at(0).toUpperCase() + locale.slice(1)}`
      //       ],
      //   products: [],
      // });
      acc[groupKey] = {
        id: groupKey,
        name: product[base]
          ? product[base][
              `name${locale.toLowerCase().at(0).toUpperCase() + locale.slice(1)}`
            ]
          : base[
              `name${locale.toLowerCase().at(0).toUpperCase() + locale.slice(1)}`
            ],
        products: [],
      };
    }
    acc[groupKey].products.push(product);
    result.push(acc[groupKey]);
    return result;
  }, {});
  // Convert object to array
  return grouped;
};
