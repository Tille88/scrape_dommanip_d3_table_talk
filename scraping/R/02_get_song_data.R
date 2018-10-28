# data-src !!!!!


#Packages
library(rvest)
library(readr)
library(stringr)
library(plyr)
library(purrr)

#Set working directory (silly, but assumes following step 1...)
setwd("/Users/jonastillman/git/coderbunker/table_proj/scraping/")
relative_year_path = "./01_yearly_links/"

# Constants
SLEEP_INTERVAL = 2 #s

# Read in the data from before
file_vector = list.files(relative_year_path)
link_list = lapply(paste0(relative_year_path, file_vector), read_csv) %>%
  unlist()


# Util functions
safe_extract_nodecontent = function(node, selector){
  res = html_nodes(node, selector) %>%
    html_text() %>%
    {
      if(length(.) == 0) NA else .
    }
  return(res)
}

file_cntr = 0
files_tot = length(link_list)
for(url in link_list){
  message("reading in ", url)
  file_cntr = file_cntr + 1
  message("File no. ", file_cntr, " of ", files_tot)

  date = str_split(url, "/") %>% pluck(1) %>% tail(1)

  webpage = read_html(url)

  # Special treatment for no. 1
  no_1_artist = str_replace_all(html_text(html_nodes(webpage,'.chart-number-one__artist')), "\n", "")
  no_1_title = html_nodes(webpage,'.chart-number-one__title') %>% html_text() %>% #not really needed, but for example
    str_replace_all("\n", "")
  # !!!
  no_1_weeks_no_1 = html_nodes(webpage,'.chart-number-one__weeks-at-one') %>%
    html_text() %>%
    as.numeric() %>%
    ifelse(length(.) > 0, ., NA)
  no_1_last_week = html_nodes(webpage,".chart-number-one__last-week") %>%
    html_text() %>%
    as.numeric() %>%
    ifelse(length(.) > 0, ., NA)
  no_1_last_week_weeks_at_one =  html_nodes(webpage,'.chart-number-one__stats-cell')[2] %>%
      html_text() %>%
      str_remove_all("\n")
  # Weeks on chart, no 1 = ? spacing sometimes not between number and text, export text...
  no_1_weeks_on_chart = html_nodes(webpage,'.chart-number-one__stats-cell')[3] %>%
      html_text() %>%
      str_remove_all("\n")

  # Generic rest of listed songs, using ".chart-details .chart-list-item  "
  #used inconsistently inserted spaces, making parsing difficult
  chart_items = html_nodes(webpage,".chart-list-item")
  no_list = lapply(chart_items, safe_extract_nodecontent, ".chart-list-item__rank ") %>%
    str_remove_all("\n") %>% as.numeric()
  artist_list = lapply(chart_items, safe_extract_nodecontent, ".chart-list-item__artist") %>%
    str_remove_all("\n")
  song_list = lapply(chart_items, safe_extract_nodecontent, ".chart-list-item__title-text") %>%
    str_remove_all("\n")
  peak_pos_list = lapply(chart_items, safe_extract_nodecontent, ".chart-list-item__weeks-at-one") %>%
    as.numeric()
  last_week_list = lapply(chart_items, safe_extract_nodecontent, ".chart-list-item__last-week") %>%
    as.numeric()
  weeks_on_chart_list = lapply(chart_items, safe_extract_nodecontent, ".chart-list-item__weeks-on-chart") %>%
    as.numeric


  # Have lists, want excel-like format
  no_1_df = data.frame(
    rank = 1,
    peak = 1,
    artist = no_1_artist,
    title = no_1_title,
    last_week = NA,
    weeks_on_chart = NA,
    no_1_weeks_no_1 = no_1_weeks_no_1,
    no_1_last_week = no_1_last_week,
    no_1_last_week_weeks_at_one = no_1_last_week_weeks_at_one,
    no_1_weeks_on_chart = no_1_weeks_on_chart
  )


  rest_df = data.frame(
    rank = no_list,
    peak = peak_pos_list,
    artist = artist_list,
    title = song_list,
    last_week = last_week_list,
    weeks_on_chart = weeks_on_chart_list,
    no_1_weeks_no_1 = NA,
    no_1_last_week = NA,
    no_1_last_week_weeks_at_one = NA,
    no_1_weeks_on_chart = NA
  )

  combined = rbind(no_1_df, rest_df)

  file_name = paste0("./02_song_list_data_raw/", date, ".csv")

  write_csv(combined, file_name)
  message("written ", file_name)

  Sys.sleep(SLEEP_INTERVAL)
}
