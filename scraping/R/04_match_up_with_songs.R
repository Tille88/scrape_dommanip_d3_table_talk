#Packages
library(readr)
library(stringr)
library(dplyr)
library(purrr)
library(jsonlite)

#Set working directory (silly, but assumes following step 1...)
setwd("/Users/jonastillman/git/coderbunker/table_proj/scraping/")
clean_data_path = "./03_clean_data_json/"


all_listings = read_json(paste0(clean_data_path, "./billboard_top_10_1990_2000.json"), simplifyVector = T)
chart_leaders = data.frame()
dates = names(all_listings)
for(i in 1:length(dates)){
  if(nrow(chart_leaders) == 0){
    chart_leaders = all_listings[[i]][1,] %>% 
      mutate(date = dates[i]) %>%
      select(date, rank, peak, artist, title, key)
  }
  chart_leaders = rbind(chart_leaders, all_listings[[i]][1,] %>% mutate(date = dates[i]) %>%
                          select(date, rank, peak, artist, title, key))
}


# have chart leaders, want the file names
list.files("../music/")
file_dirs = list.dirs("../music/backup/")
file_dirs = file_dirs[2:length(file_dirs)]
file_list = c()

for(dir in file_dirs){
  file_directory_list = paste0(dir, "/", list.files(dir))
  file_list = c(file_list, file_directory_list)
}

file_df = data.frame(dir = file_list)
file_names = as.character(file_df$dir) %>% 
  str_split("- [0-9]+ - ")
file_names[1]
file_df$file_name = lapply(file_names, pluck, 2) %>% unlist()

artist_song_list = file_df$file_name %>% str_split(" - ")
file_df$artist = lapply(artist_song_list, pluck, 1) %>% unlist() 
file_df$song = lapply(artist_song_list, pluck, 2) %>% 
  unlist() %>%
  str_remove_all(".mp3")

#Lets see how well they match up without any processing...
TBR = chart_leaders %>% 
  left_join(file_df, by="artist") %>%
  filter(title == song | is.na(dir)) %>% unique() 

duplicate_dates = TBR %>% 
  group_by(date) %>% 
  summarise(n = n()) %>% 
  # arrange(desc(n)) %>%
  filter(n>1) %>%
  select(date)

# Duplcate date rows...
# test = TBR %>% inner_join(duplicate_dates, by="date")
test_filtered = TBR[!duplicated(TBR$date), ] #%>% nrow()
clean_join = chart_leaders %>% left_join(test_filtered, by="date")

# Will be combined...
clean_join_still_nas = clean_join %>% filter(is.na(dir)) %>% 
  select(date, rank=rank.x, peak=peak.x, artist=artist.x, title=title.x, key=key.x)
clean_join_no_nas = clean_join %>% filter(!is.na(dir)) %>% 
  select(date, rank=rank.x, peak=peak.x, artist=artist.x, title=title.x, key=key.x, dir, file_name)
# clean_join_still_nas %>% select(artist = artist.x, title = title.x, artist.y, title.y, key = key.x) %>% View() 

# All "From" songs...
from_soundtrack = clean_join_still_nas %>% filter(str_detect(title, "From"))
from_soundtrack$title = from_soundtrack$title %>% str_remove("\\(From \"[A-Za-z0-9 &]+\"\\)") %>%
                                                               str_trim()
from_soundtrack_joined = from_soundtrack %>% left_join(file_df, by=c("title" = "song"))
from_soundtrack_joined = from_soundtrack_joined[!duplicated(from_soundtrack_joined$date), ]
from_soundtrack_joined = from_soundtrack_joined %>% 
  select(date, rank, peak, artist=artist.x, title, key, dir, file_name)

clean_join_no_nas = rbind(clean_join_no_nas, from_soundtrack_joined)

# Remove those found from the NA-list...
clean_join_still_nas = clean_join_still_nas %>% filter(!(date %in% from_soundtrack_joined$date))
# Now for this subsection, join on title...

joined_through_song = clean_join_still_nas %>% left_join(file_df, by=c("title" = "song")) %>% filter(!is.na(dir))
joined_through_song = joined_through_song[!duplicated(joined_through_song$date), ]
joined_through_song = joined_through_song %>% 
  select(date, rank, peak, artist=artist.x, title, key, dir, file_name)
clean_join_no_nas = rbind(clean_join_no_nas, joined_through_song)

# Already here remove from list those that are still NA's
clean_join_still_nas = clean_join_still_nas %>% filter(!(date %in% joined_through_song$date))

# Ugh.. still 29 to go..., but only really 8 different ones... Let's do them manually...
# C+C Music Factory
file_df[which(str_detect(file_df$artist, "Factory")),]
manual_df_file_lists = file_df[103,]
manual_df_file_lists$artist[1] = "C+C Music Factory"

# Amy Grant - Baby Baby
file_df[which(str_detect(file_df$artist, "Grant")),]
manual_df_file_lists = rbind(manual_df_file_lists, file_df[110,])
manual_df_file_lists$artist[2] = "Amy Grant"

# Peabo Bryson & Regina Belle - A Whole New World (Aladdin's Theme
file_df[which(str_detect(file_df$artist, "Peabo")),]
manual_df_file_lists = rbind(manual_df_file_lists, file_df[318,])
manual_df_file_lists$artist[3] = "Peabo Bryson & Regina Belle"

# Bryan Adams - Have You Ever Really Loved A Woman?
file_df[which(str_detect(file_df$artist, "Bryan")),]
manual_df_file_lists = rbind(manual_df_file_lists, file_df[518,])
manual_df_file_lists$artist[4] = "Bryan Adams"

#2Pac Featuring K-Ci And JoJo - How Do U Want It/California Love
file_df[which(str_detect(file_df$artist, "2Pac")),]
manual_df_file_lists = rbind(manual_df_file_lists, file_df[627,])
manual_df_file_lists$artist[5] = "2Pac Featuring K-Ci And JoJo"

# Toni Braxton - You're Makin' Me High/Let It Flow
file_df[which(str_detect(file_df$artist, "Braxton")),]
manual_df_file_lists = rbind(manual_df_file_lists, file_df[617,])
manual_df_file_lists$artist[6] = "Toni Braxton"

# Elton John - Candle In The Wind 1997
file_df[which(str_detect(file_df$artist, "Elton")),]
manual_df_file_lists = rbind(manual_df_file_lists, file_df[717,])
manual_df_file_lists$artist[7] = "Elton John"

# Brandy - Have You Ever?
file_df[which(str_detect(file_df$artist, "Brandy")),]
manual_df_file_lists = rbind(manual_df_file_lists, file_df[937,])
manual_df_file_lists$artist[8] = "Brandy"
manual_joined = clean_join_still_nas %>% 
  left_join(manual_df_file_lists, by="artist")
manual_joined = manual_joined %>% 
  select(date, rank, peak, artist, title, key, dir, file_name)
clean_join_no_nas = rbind(clean_join_no_nas, manual_joined)
clean_join_no_nas[717,]

# Make copy of files... and rename to key.mp3 for clarity...
for(i in 1:nrow(clean_join_no_nas)){
  file.copy(as.character(clean_join_no_nas$dir[i]), paste0('../music/combined_years/', clean_join_no_nas$key[i], '.mp3'))
}

# Some warnings, but damnit, close enough... way down the pipeline anyway... Have 153/158 files...
# unique(clean_join_no_nas$key) %>% length()

# TODO
# SORT BY DATE...
# Export alternative JSON with filename...



