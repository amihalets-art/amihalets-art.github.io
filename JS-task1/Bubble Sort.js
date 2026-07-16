function bubbleSort(arr) {
  let n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    let swapped = false; 
    
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) { 
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        
        swapped = true; 
      }
    }
    
    if (!swapped) break;
  }
  
  return arr;
}

console.log("Bubble Sort:", bubbleSort([64, 34, 25, 12, 22, 11, 90]));