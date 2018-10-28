#Packages
library(readr)
library(stringr)
library(dplyr)

#Set working directory (silly, but assumes following step 1...)
setwd("/Users/jonastillman/git/coderbunker/table_proj/scraping/R/")
song_list_path = "./02_img_links/"
target_path = "./03_images/"

# Constants
SLEEP_INTERVAL = 0.25 #s

# Want the unique links from the previous step
file_list = list.files(song_list_path)

unique_images = file_list %>% lapply(function(file_name){
  read_csv(paste0(song_list_path, file_name))
}) %>% 
  unlist() %>%
  unique()


for(image_url in unique_images){
  message("Downloading ", image_url)
  file_name = image_url %>% 
    str_split("/") %>% unlist() %>%
    tail(1)
  print(file_name)
  download.file(image_url, paste0(target_path, file_name), method = "libcurl")
  Sys.sleep(SLEEP_INTERVAL)
}




