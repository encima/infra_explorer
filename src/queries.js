import {gql} from "@apollo/client";

export const RegionsFacet = gql`
query GetRegions($cloud: String = "aws"){
    products(filter: {
      vendorName: $cloud
    }) {
      region
    }
  }
`;

export const InstancesQuery = gql`
        query GetInstances(
          $cloud: String
          $service: String
          $product: String
          $region: String
        ) {
          products(
            filter: {
              vendorName: $cloud
              service: $service
              productFamily: $product
              region: $region
            }
          ) {
            prices {
              USD
            }
            attributes {
              key
              value
            }
          }
        }
      `;