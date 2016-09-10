import click, pandas

@click.command()
@click.argument('source', nargs=1, type=click.File('r'))
@click.argument('target', nargs=1, type=click.File('w'))
@click.argument('column', nargs=-1, required=True)
def filter(source, target, column):
    df = pandas.read_csv(source)

    df = df[df.dist < 100000][df.proper != 'Sol']
    df = df[list(column)]

    df.to_csv(target, index=False)

if __name__ == '__main__':
    filter()
