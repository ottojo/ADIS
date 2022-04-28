import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.FileSystems;
import java.nio.file.StandardOpenOption;
import java.nio.charset.StandardCharsets;
import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.Scanner;

import static java.net.URLEncoder.encode;
import static java.net.URLDecoder.decode;

public class post {
    public static void main(String[] args) {
        // data path should be passed in by the wrapper script
        if (args.length == 0) {
            printResult("<h1>Internal error (missing data path)</h1>");
            return;
        }
        
        try {
            // Extract name and message from query string or request body
            String[] result = parseBody(); // parseQueryString()
            String author = result[0], content = result[1];

            // Throws an exception if author or content aren't valid
            validateNameAndMessage(author, content);

            // Write new post to the CSV file by appending
            Files.write(
                    FileSystems.getDefault().getPath(args[0], "posts.csv"), 
                    (String.join(",", System.currentTimeMillis()+"", author, content) + "\n")
                        .getBytes(StandardCharsets.UTF_8),
                    StandardOpenOption.APPEND, StandardOpenOption.CREATE);
        } catch (Exception e) {
            printResult("<h1>Internal error (" + e.getMessage() + ")</h1>");
            return;
        }
        
        printResult(null);
    }

    // Extracts author and content from a x-www-form-urlencoded POST body. Index 0 is author, Index 1 is content
    private static String[] parseBody() throws UnsupportedEncodingException {
        return parseData(new Scanner(System.in, StandardCharsets.UTF_8));
    }

    // Extracts author and content from the url query string. Index 0 is author, Index 1 is content
    private static String[] parseQueryString() throws UnsupportedEncodingException {
        String query = System.getenv().getOrDefault("QUERY_STRING", null);

        if (query == null)
            throw new RuntimeException("Invalid query string");

        return parseData(new Scanner(query));
    }

    // Extracts author and content from an arbitrary x-www-form-urlencoed input source wrapped in a Scanner. 
    // Index 0 is author, Index 1 is content
    private static String[] parseData(Scanner scanner) throws UnsupportedEncodingException {
        String[] result = new String[2];
        scanner.useDelimiter("&");

        while (scanner.hasNext()) {
            String[] pair = scanner.next().split("=", 2);
            
            if (pair.length != 2)
                throw new RuntimeException("Invalid input: not x-www-form-urlencoded");

            if (pair[0].equalsIgnoreCase("name")) {
                result[0] = pair[1];
            } else if (pair[0].equalsIgnoreCase("message")) {
                result[1] = pair[1];
            }
        }
        
        if (result[0] == null || result[1] == null)
            throw new RuntimeException("Missing name or message");
        
        // We rely on the data in posts.csv to be properly urlencoded!
        // If not this may break index.java
        // Use a very simple trick to ensure this: encode(decode(...))
        // If properly urlencoded => no change; if not => now it is!
        
        result[0] = encode(decode(result[0], "UTF-8"), "UTF-8");
        result[1] = encode(decode(result[1], "UTF-8"), "UTF-8");

        return result;
    }

    // Validates name and message for a new post (e.g. non-emptiness and character limit)
    private static void validateNameAndMessage(String name, String message) {
        if (message.isEmpty())
            throw new RuntimeException("Missing message");
        if (message.length() > 128)
            throw new RuntimeException("Max message length: 128 characters");

        if (name.isEmpty())
            throw new RuntimeException("Missing name");
        if (name.length() > 20)
            throw new RuntimeException("Max name length: 20 characters");
    }

    // errMsg must be null if there was no error, otherwise the error reason
    private static void printResult(String errMsg) {
        if (errMsg != null) {
            System.out.print("Content-Type: text/html\r\n");
        } else {
            System.out.print("Status: 303 See other\r\n");
            System.out.print("Location: ./index.cgi\r\n");
        }
        
        System.out.print("\r\n");
        
        if (errMsg != null)
            System.out.print(errMsg);
    }
}
