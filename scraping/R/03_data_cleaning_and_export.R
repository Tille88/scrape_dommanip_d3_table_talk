#Packages
library(readr)
library(stringr)
library(dplyr)
library(jsonlite)


#Set working directory (silly, but assumes following step 1...)
setwd("/Users/jonastillman/git/coderbunker/table_proj/scraping/")
raw_data_path = "./02_song_list_data_raw/"

# Constants
TOP_SONGS = 10

main = function(){
  # Read in the raw from before
  file_vector = list.files(raw_data_path)
  
  
  list_of_processed_dfs = lapply(paste0(raw_data_path, file_vector), process_df)
  names(list_of_processed_dfs) <- str_replace(file_vector, ".csv", "") 
  
  # for(list in list_of_processed_dfs){
  #   print(list[1,]$key)
  # }
  
  jsonlite::write_json(list_of_processed_dfs, path = "./03_clean_data_json/billboard_top_10_1990_2000.json")
}



process_df = function(file_path){
  raw_df = read_csv(file_path, n_max = TOP_SONGS)
  no_1 = raw_df[1,]
  no_1$weeks_on_chart = str_match(no_1$no_1_weeks_on_chart, "[0-9]+") %>% as.numeric()
  no_1$last_week = if(!is.na(no_1$no_1_weeks_no_1)) 1 else no_1$no_1_last_week 
  processed_df = raw_df
  processed_df[1,] = no_1
  
  # Remove unneeded columns
  # Rename weeks as no. 1
  # Generate key
  processed_df = processed_df %>% 
    select(rank:weeks_on_chart, weeks_no_1 = no_1_weeks_no_1) %>%
    mutate(key = gen_key(artist, title))
  
  return(processed_df)  
}



gen_key = function(artist, song){
  artist_norm = str_to_lower(artist) %>% 
    str_trim() %>% 
    str_replace_all("['().]", "") %>%
    str_replace_all(" ", "-")
  song_norm = str_to_lower(song) %>%
    str_replace("\\(from \"[a-z0-9 &]+\"\\)", "") %>%
    str_trim() %>% 
    str_replace_all("['().]", "") %>%
    str_replace_all(" ", "-")
  key = paste(artist_norm, song_norm, sep = "-")
  return(key)
}

main()


"roxette-it-must-have-been-love-from-\"Pretty Woman\"" %>% str_replace("from-\"[A-Za-z0-9 ]+\"", ".")


# jsonlite::toJSON(processed_df, pretty = T)
# jsonlite::toJSON(list_of_processed_dfs, pretty = T)