#Packages
library(rvest)
library(readr)

#Set working directory
setwd("/Users/jonastillman/git/coderbunker/table_proj/scraping/R/01_yearly_links/")

# Constants
SLEEP_INTERVAL = 3 #s
BASE_URL = "https://www.billboard.com"

main = function(){
  
  years_to_scrape = c(1990)#seq(1990, 2000)
  
  for(year in years_to_scrape){
    #Specifying the url for desired website to be scrapped
    url = paste0("https://www.billboard.com/archive/charts/", year, "/hot-100")
    
    # write to file
    link_list = get_yearly_link_list(url)
    write_csv(data.frame(link_list), paste0(year, ".csv"))
    
    # Why not take a little nap...
    closeAllConnections()
    Sys.sleep(SLEEP_INTERVAL)
  }
  
} 



# a list of links to billboard yearly list
get_yearly_link_list = function(url){
  message("get yearly link list ", url)
  #Reading the HTML code from the website
  webpage = read_html(url)
  
  #Want all the links
  rank_data_html = html_nodes(webpage,'td a')
  
  #Converting the ranking data to text
  link_extensions = html_attr(rank_data_html, name = "href")
  
  # Get part of interest in text format
  link_list = paste0(BASE_URL, link_extensions)
  
  # explicit return
  return(link_list)
}


main()








# url = 'https://www.billboard.com/charts/billboard-200/1990-01-06'
