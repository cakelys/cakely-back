const calculateDistance = (
  userLatitude,
  userLongitude,
  latitudeField,
  longitudeField,
) => {
  return {
    $multiply: [
      6371,
      {
        $acos: {
          $min: [
            1,
            {
              $add: [
                {
                  $multiply: [
                    {
                      $sin: { $multiply: [Math.PI / 180, latitudeField] },
                    },
                    {
                      $sin: {
                        $multiply: [Math.PI / 180, userLatitude],
                      },
                    },
                  ],
                },
                {
                  $multiply: [
                    {
                      $cos: { $multiply: [Math.PI / 180, latitudeField] },
                    },
                    {
                      $cos: {
                        $multiply: [Math.PI / 180, userLatitude],
                      },
                    },
                    {
                      $cos: {
                        $subtract: [
                          { $multiply: [Math.PI / 180, longitudeField] },
                          { $multiply: [Math.PI / 180, userLongitude] },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
  };
};

export default calculateDistance;
