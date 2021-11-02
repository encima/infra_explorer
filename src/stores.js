import {writable} from "svelte/store";


export let selectedCloud = writable(localStorage.getItem("selectedCloud") || "gcp");
export let regions = writable(localStorage.getItem("regions") || []);
export let selectedRegion = writable(localStorage.getItem("selectedRegion") || "europe-west1");
export let cloudMappings = writable(localStorage.getItem("cloudMappings") || {
    gcp: {
      vendorName: "gcp",
      service: "Compute Engine",
      productFamily: "Compute Instance",
      instanceKey: "machineType",
	  instances: [],
	  regions: []
    },
    aws: {
      vendorName: "aws",
      service: "AmazonEC2",
      productFamily: "Compute Instance",
      instanceKey: "instanceType",
	  instance: "i3en.xlarge",
	  instances: [],
	  regions: []
    },
    azure: {
      vendorName: "azure",
      service: "Virtual Machines",
      productFamily: "Compute",
      instanceKey: "skuName",
	  instances: [],
	  regions: []
    },
  });

  
