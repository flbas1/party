using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var projectRoot = Path.GetFullPath(
    Path.Combine(app.Environment.ContentRootPath, ".."));

var distPath = Path.Combine(projectRoot, "dist");
var partyRoot = Path.Combine(projectRoot, "partytime");

var distProvider = new PhysicalFileProvider(distPath);

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = distProvider
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = distProvider
});

app.MapGet("/bootstrap.yml", async () =>
{
    var path = Path.Combine(projectRoot, "bootstrap.yml");

    if (!File.Exists(path))
        return (IResult)Results.NotFound("bootstrap.yml not found");

    var yaml = await File.ReadAllTextAsync(path);
    return Results.Text(yaml, "application/yaml");
});

// Discover parties. Default-marked parties sort first, then by ID.
app.MapGet("/api/parties", () =>
{
    
    if (!Directory.Exists(partyRoot))
        return Results.Ok(Array.Empty<object>());

    var parties = Directory
        .EnumerateDirectories(partyRoot)
        .Select(directory =>
        {
            var id = Path.GetFileName(directory);
            var configPath = Path.Combine(directory, "config.yml");
            var isDefault = File.Exists(
                Path.Combine(directory, ".default"));

            return new
            {
                id,
                exists = File.Exists(configPath),
                isDefault
            };
        })
        .Where(party => party.exists)
        .OrderByDescending(party => party.isDefault)
        .ThenBy(party => party.id, StringComparer.OrdinalIgnoreCase)
        .Select(party => new
        {
            party.id,
            party.isDefault,
            configUrl = $"/api/parties/{party.id}/config"
        })
        .ToArray();

    return Results.Ok(parties);
});

app.MapGet("/api/parties/{partyId}/config", async (string partyId) =>
{
    // IDs are folder names, not arbitrary filesystem paths.
    if (string.IsNullOrWhiteSpace(partyId) ||
        partyId.Any(c => !char.IsAsciiLetterOrDigit(c) &&
                         c != '-' && c != '_'))
    {
        return (IResult)Results.BadRequest("Invalid party ID");
    }

    var path = Path.Combine(partyRoot, partyId, "config.yml");

    if (!File.Exists(path))
        return Results.NotFound("Party configuration not found");

    var yaml = await File.ReadAllTextAsync(path);
    return Results.Text(yaml, "application/yaml");
});



app.MapGet("/api/parties/{partyId}/{**file}", (string partyId, string file) =>
{
    if (string.IsNullOrWhiteSpace(partyId) ||
        partyId.Any(c => !char.IsAsciiLetterOrDigit(c) &&
                         c != '-' && c != '_'))
    {
        return Results.BadRequest("Invalid party ID");
    }

    if (string.IsNullOrWhiteSpace(file) ||
        file.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
    {
        return Results.BadRequest("Invalid filename");
    }

    var partyDirectory = Path.GetFullPath(
        Path.Combine(partyRoot, partyId));

    var path = Path.GetFullPath(
        Path.Combine(partyDirectory, file));

    var relativePath = Path.GetRelativePath(partyDirectory, path);

    if (Path.IsPathRooted(relativePath) ||
        relativePath == ".." ||
        relativePath.StartsWith(
            ".." + Path.DirectorySeparatorChar,
            StringComparison.Ordinal) ||
        relativePath.StartsWith(
            ".." + Path.AltDirectorySeparatorChar,
            StringComparison.Ordinal))
    {
        return Results.BadRequest("Invalid path");
    }

    if (!File.Exists(path))
        return Results.NotFound();

    var contentType = Path.GetExtension(path).ToLowerInvariant() switch
    {
        ".css" => "text/css",
        ".html" => "text/html",
        ".js" => "text/javascript",
        ".json" => "application/json",
        ".svg" => "image/svg+xml",
        ".png" => "image/png",
        ".jpg" or ".jpeg" => "image/jpeg",
        ".webp" => "image/webp",
        ".gif" => "image/gif",
        ".ico" => "image/x-icon",
        ".yml" or ".yaml" => "application/yaml",
        ".txt" => "text/plain",
        _ => "application/octet-stream"
    };

    return Results.File(path, contentType);
});


app.Run();
