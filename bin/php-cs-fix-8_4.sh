#!/bin/bash
if [ -f vendor/bin/php-cs-fixer ]; then
  # Run the default fix for the nullable_type_declaration_for_default_null_value rule
  PHP_CS_FIXER_IGNORE_ENV=1 vendor/bin/php-cs-fixer fix vendor/woocommerce/analytics/dependencies --using-cache=no --rules='nullable_type_declaration_for_default_null_value'
  
  # Custom fix for one specific error:
  # PHP Deprecated:  Automattic\WooCommerce\Analytics\Dependencies\DI\Definition\Resolver\ObjectCreator::setPrivatePropertyValue(): 
  #  Optional parameter $className declared before required parameter $propertyValue is implicitly treated as a required parameter 
  #  in vendor/woocommerce/analytics/dependencies/src/DI/Definition/Resolver/ObjectCreator.php on line 212
  # Linux and MacOS have different sed syntax
  case "$OSTYPE" in
    darwin*)
      sed -i '' 's/public static function setPrivatePropertyValue(?string $className = null, /public static function setPrivatePropertyValue(?string $className, /' vendor/woocommerce/analytics/dependencies/src/DI/Definition/Resolver/ObjectCreator.php
      echo "MacOS: Fixed the specific required parameters after optional parameters notice in the ObjectCreator class."
      ;;
    *)
      echo "Linux: Fixed the specific required parameters after optional parameters notice in the ObjectCreator class."
      sed -i 's/public static function setPrivatePropertyValue(?string $className = null, /public static function setPrivatePropertyValue(?string $className, /' vendor/woocommerce/analytics/dependencies/src/DI/Definition/Resolver/ObjectCreator.php
      ;;
  esac
fi
