# Define public package exports

Add a public `exports` map that closes package deep imports while preserving the root API. First add the i18n export and migrate plugin-templates off its deep import (WIs 16–17); WI 18 adds the map and `./effect` target, and WI 24 implements the Effect-native API. Hold the v67 publish until WIs 20 and 24.
