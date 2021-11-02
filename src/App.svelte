<script lang="ts">
  import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    gql
  } from "@apollo/client";
import { SvelteApolloClient } from "svelte-apollo-client";
import { Datatable, rows } from 'svelte-simple-datatables'
import {cloudMappings, selectedCloud, regions, selectedRegion} from "./stores"
import {RegionsFacet, InstancesQuery} from "./queries";
import {API_KEY} from "./config";
const settings = {
        sortable: true,
        pagination: true,
        rowPerPage: 50,
        columnFilter: true,
    }

  const client = SvelteApolloClient({
    uri: "https://infracost.aiven.dev/graphql",
    headers: { "X-API-Key": API_KEY },
    cache: new InMemoryCache(),
  });

  export let data = {};
  export let tableData = [];

//   const columns = [
//   {
//     key: "id",
//     title: "ID",
//     value: v => v.id
//   }];




async function handleCloudSelect(e) {
  selectedCloud.set(e.target.value);
  getRegions($selectedCloud);
  data = await post($selectedCloud);
}

function handleRegionSelect(e) {
  selectedRegion.set(e.target.value);
  post($selectedCloud)
}

async function getRegions(cloud) {
  try {
    //   const { limit } = request.body;
      return await client.query(RegionsFacet, {variables: {
        cloud: $cloudMappings[cloud]["vendorName"],
      }}).result().then(res => {
        let regionList: Array<Object> = res.data['products'];
        let sortedRegions = [];
        regionList.forEach((val) => {
          if(val['region'] !== null && sortedRegions.indexOf(val['region']) === -1) {
            sortedRegions.push(val['region'])
          }
        })
        regions.set(sortedRegions.sort())
        selectedRegion.set(regions[0])
      })

      
    } catch (err) {
      console.error("Error: ", err);
      return {
        status: 500,
        error: "Error receiving data",
      };
    }
}

  export async function post(cloud) {
    try {
      client.query(InstancesQuery, {variables: {
        cloud: $cloudMappings[cloud]["vendorName"],
          service: $cloudMappings[cloud]["service"],
          product: $cloudMappings[cloud]["productFamily"],
          instanceKey: $cloudMappings[cloud]["instanceKey"],
          region: $selectedRegion,
      }}).result().then(res => {
        tableData = [];
        res.data['products'].forEach(row => {
	      let vm = {}
	      row['attributes'].map(attr => {
            let k = attr['key']
            if (k === "instanceType" || k === "productName") {
            k = "machineType"
            }
            vm[k] = attr['value']
          })
          if((row['prices'].length > 0)) {
            vm['hourly_price_usd'] = row['prices'][0]['USD'];
          }
          tableData.push(vm);
        });
      })
      

      
    } catch (err) {
      console.error("Error: ", err);
      return {
        status: 500,
        error: "Error receiving data",
      };
    }
  }
  
  getRegions($selectedCloud).then(() => {
    post($selectedCloud);
  })
  
  
</script>

<main>
  <h1>Hello {$selectedCloud}!</h1>
  

  <select name="cloudPicker" id="cloudList" on:change={handleCloudSelect}>
    <option value="gcp">GCP</option>
    <option value="aws">AWS</option>
    <option value="azure">Azure</option>
  </select>

  <select value={selectedRegion} on:change={handleRegionSelect}>
		{#each $regions as region}
			<option value={region}>
				{region}
			</option>
		{/each}
	</select>


	<Datatable settings={settings} data={tableData}>
		<thead>
			<th data-key="instance">Instance</th>
			<th data-key="price">Price</th>
		</thead>
		<tbody>
		{#each $rows as row}
			<tr>
				<td>{row.machineType}</td>
				<td>{row.hourly_price_usd}</td>
			</tr>
		{/each}
		</tbody>
	</Datatable>
	 
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
